import { KarmaClient } from './karma';

// Save link to native Date object
// before it might be mocked by the user
var _Date = Date;

/**
 * Decision maker for whether a stack entry is considered external to jasmine and karma.
 * @param  {String}  entry Error stack entry.
 * @return {Boolean}       True if external, False otherwise.
 */
function isExternalStackEntry(entry: string) {
  return (
    !!entry &&
    // entries related to jasmine and karma-jasmine:
    !/\/(jasmine-core|karma-jasmine)\//.test(entry) &&
    // karma specifics, e.g. "at http://localhost:7018/karma.js:185"
    !/\/(karma.js|context.html):/.test(entry)
  );
}

/**
 * Returns relevant stack entries.
 * @param  {Array} stack frames
 * @return {Array}        A list of relevant stack entries.
 */
function getRelevantStackFrom(stack: string[]): string[] {
  var filteredStack: string[] = [];
  var relevantStack: string[] = [];

  for (var i = 0; i < stack.length; i += 1) {
    if (isExternalStackEntry(stack[i])) {
      filteredStack.push(stack[i]);
    }
  }

  // If the filtered stack is empty, i.e. the error originated entirely from within jasmine or karma, then the whole stack
  // should be relevant.
  if (filteredStack.length === 0) {
    filteredStack = stack;
  }

  for (i = 0; i < filteredStack.length; i += 1) {
    if (filteredStack[i]) {
      relevantStack.push(filteredStack[i]);
    }
  }

  return relevantStack;
}

/**
 * Custom formatter for a failed step.
 *
 * Different browsers report stack trace in different ways. This function
 * attempts to provide a concise, relevant error message by removing the
 * unnecessary stack traces coming from the testing framework itself as well
 * as possible repetition.
 *
 * @see    https://github.com/karma-runner/karma-jasmine/issues/60
 * @param  {Object} step Step object with stack and message properties.
 * @return {String}      Formatted step.
 */
function formatFailedStep(step: Record<string, any>): string {
  var relevantMessage: string[] = [];
  var relevantStack: string[] = [];

  // Safari/Firefox seems to have no stack trace,
  // so we just return the error message and if available
  // construct a stacktrace out of filename and lineno:
  if (!step.stack) {
    if (step.filename) {
      var stackframe: string = step.filename;
      if (step.lineno) {
        stackframe = stackframe + ':' + step.lineno;
      }
      relevantStack.push(stackframe);
    }
    relevantMessage.push(step.message);
    return relevantMessage.concat(relevantStack).join('\n');
  }

  // Remove the message prior to processing the stack to prevent issues like
  // https://github.com/karma-runner/karma-jasmine/issues/79
  var stackframes = step.stack.split('\n');
  var messageOnStack = null;
  if (stackframes[0].indexOf(step.message) !== -1) {
    // Remove the message if it is in the stack string (eg Chrome)
    messageOnStack = stackframes.shift();
  }
  // Filter frames
  var relevantStackFrames = getRelevantStackFrom(stackframes);
  if (messageOnStack) {
    // Put the message back if we removed it.
    relevantStackFrames.unshift(messageOnStack);
  } else {
    // The stack did not have the step.message so add it.
    relevantStackFrames.unshift(step.message);
  }

  return relevantStackFrames.join('\n');
}

class SuiteNode {
  constructor(public name?: string, public parent?: SuiteNode) {}
  description!: string;
  children: any[] = [];

  addChild(name: string) {
    var suite = new SuiteNode(name, this);
    this.children.push(suite);
    return suite;
  }
}

function processSuite(suite: SuiteNode, pointer: Record<string, any>) {
  var child;
  var childPointer;

  for (var i = 0; i < suite.children.length; i++) {
    child = suite.children[i];

    if (child.children) {
      childPointer = pointer[child.description] = { _: [] };
      processSuite(child, childPointer);
    } else {
      if (!pointer._) {
        pointer._ = [];
      }
      pointer._.push(child.description);
    }
  }
}

function getAllSpecNames(topSuite: SuiteNode) {
  var specNames = {};

  processSuite(topSuite, specNames);

  return specNames;
}

/**
 * Very simple reporter for Jasmine.
 */
class KarmaReporter implements jasmine.CustomReporter {
  currentSuite = new SuiteNode();

  startTimeCurrentSpec = new _Date().getTime();

  constructor(private tc: KarmaClient, private jasmineEnv: jasmine.Env) {}
  handleGlobalErrors(result: Record<string, any>) {
    if (result.failedExpectations && result.failedExpectations.length) {
      var message: string = 'An error was thrown in afterAll';
      var steps = result.failedExpectations;
      for (var i = 0, l = steps.length; i < l; i++) {
        message += '\n' + formatFailedStep(steps[i]);
      }

      this.tc.error(message);
    }
  }

  /**
   * Jasmine 2.0 dispatches the following events:
   *
   *  - jasmineStarted
   *  - jasmineDone
   *  - suiteStarted
   *  - suiteDone
   *  - specStarted
   *  - specDone
   */

  jasmineStarted(data: Record<string, any>) {
    // TODO(vojta): Do not send spec names when polling.
    this.tc.info({
      event: 'jasmineStarted',
      total: data.totalSpecsDefined,
      specs: getAllSpecNames(this.jasmineEnv.topSuite() as any),
    });
  }

  jasmineDone(result: Record<string, any>) {
    result = result || {};

    // Any errors in top-level afterAll blocks are given here.
    this.handleGlobalErrors(result);

    // Remove functions from called back results to avoid IPC errors in Electron
    // https://github.com/twolfson/karma-electron/issues/47
    var cleanedOrder!: Record<string, any>;
    if (result.order) {
      cleanedOrder = {};
      var orderKeys = Object.getOwnPropertyNames(result.order);
      for (var i = 0; i < orderKeys.length; i++) {
        var orderKey = orderKeys[i];
        if (typeof result.order[orderKey] !== 'function') {
          cleanedOrder[orderKey] = result.order[orderKey];
        }
      }
    }
    // todo 单元测试覆盖率移除
    this.tc.complete({
      order: cleanedOrder,
      coverage: undefined,
    });
  }

  suiteStarted(result: Record<string, any>) {
    this.currentSuite = this.currentSuite.addChild(result.description);
    this.tc.info({
      event: 'suiteStarted',
      result: result,
    });
  }

  suiteDone(result: Record<string, any>) {
    // In the case of xdescribe, only "suiteDone" is fired.
    // We need to skip that.
    if (result.description !== this.currentSuite.name) {
      return;
    }

    // Any errors in afterAll blocks are given here, except for top-level
    // afterAll blocks.
    this.handleGlobalErrors(result);

    this.currentSuite = this.currentSuite.parent!;

    this.tc.info({
      event: 'suiteDone',
      result: result,
    });
  }

  specStarted() {
    this.startTimeCurrentSpec = new _Date().getTime();
  }

  specDone(specResult: Record<string, any>) {
    var skipped =
      specResult.status === 'disabled' ||
      specResult.status === 'pending' ||
      specResult.status === 'excluded';
    var result = {
      fullName: specResult.fullName,
      description: specResult.description,
      id: specResult.id,
      log: [] as string[],
      skipped: skipped,
      disabled:
        specResult.status === 'disabled' || specResult.status === 'excluded',
      pending: specResult.status === 'pending',
      success: specResult.failedExpectations.length === 0,
      suite: [] as string[],
      time: skipped ? 0 : new _Date().getTime() - this.startTimeCurrentSpec,
      executedExpectationsCount:
        specResult.failedExpectations.length +
        specResult.passedExpectations.length,
      passedExpectations: specResult.passedExpectations,
      properties: specResult.properties,
    };

    // generate ordered list of (nested) suite names
    var suitePointer = this.currentSuite;
    while (suitePointer.parent) {
      result.suite.unshift(suitePointer.name!);
      suitePointer = suitePointer.parent;
    }

    if (!result.success) {
      var steps = specResult.failedExpectations;
      for (var i = 0, l = steps.length; i < l; i++) {
        result.log.push(formatFailedStep(steps[i]));
      }

      //todo 永远不可能赋值当前
      // Report the name of fhe failing spec so the reporter can emit a debug url.
      // (result as any).debug_url = debugUrl(specResult.fullName);
    }

    // When failSpecWithNoExpectations is true, Jasmine will report specs without expectations as failed
    if (
      result.executedExpectationsCount === 0 &&
      specResult.status === 'failed'
    ) {
      result.success = false;
      result.log.push('Spec has no expectations');
    }

    this.tc.result(result);
    delete specResult.startTime;
  }
}

/**
 * Extract grep option from karma config
 * @param {[Array|string]} clientArguments The karma client arguments
 * @return {string} The value of grep option by default empty string
 */
var getGrepOption = function (clientArguments: any[] | string) {
  var grepRegex = /^--grep=(.*)$/;

  if (Object.prototype.toString.call(clientArguments) === '[object Array]') {
    var indexOfGrep = indexOf(clientArguments as any[], '--grep');

    if (indexOfGrep !== -1) {
      return clientArguments[indexOfGrep + 1];
    }

    return (
      map(
        filter(clientArguments as any[], function (arg: string) {
          return grepRegex.test(arg);
        }),
        function (arg) {
          return arg.replace(grepRegex, '$1');
        }
      )[0] || ''
    );
  } else if (typeof clientArguments === 'string') {
    var match = /--grep=([^=]+)/.exec(clientArguments);

    return match ? match[1] : '';
  }
};

var createRegExp = function (filter: string) {
  filter = filter || '';
  if (filter === '') {
    return new RegExp(''); // to match all
  }

  var regExp = /^[/](.*)[/]([gmixXsuUAJD]*)$/; // pattern to check whether the string is RegExp pattern

  var parts = regExp.exec(filter);
  if (parts === null) {
    return new RegExp(filter.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')); // escape functional symbols
  }

  var patternExpression = parts[1];
  var patternSwitches = parts[2];
  return new RegExp(patternExpression, patternSwitches);
};

function getGrepSpecsToRun(clientConfig: Record<string, any>, specs: any[]) {
  var grepOption = getGrepOption(clientConfig.args);
  if (grepOption) {
    var regExp = createRegExp(grepOption);
    return filter(specs, function specFilter(spec: any) {
      return regExp.test(spec.getFullName());
    });
  }
}

function parseQueryParams(location: Record<string, any>) {
  var params: Record<string, any> = {};
  if (location && Object.prototype.hasOwnProperty.call(location, 'search')) {
    var pairs = location.search.substr(1).split('&');
    for (var i = 0; i < pairs.length; i++) {
      var keyValue = pairs[i].split('=');
      params[decodeURIComponent(keyValue[0])] = decodeURIComponent(keyValue[1]);
    }
  }
  return params;
}

function getId(s: { id: any }) {
  return s.id;
}

function getSpecsByName(specs: any[], name: string) {
  specs = specs.filter(function (s) {
    return s.name.indexOf(name) !== -1;
  });
  if (specs.length === 0) {
    throw new Error('No spec found with name: "' + name + '"');
  }
  return specs;
}

function getDebugSpecToRun(location: Record<string, any>, specs: any[]) {
  var queryParams: Record<string, any> = parseQueryParams(location);
  var spec = queryParams.spec;
  if (spec) {
    // A single spec has been requested by name for debugging.
    return getSpecsByName(specs, spec);
  }
}

function getSpecsToRunForCurrentShard(
  specs: any[],
  shardIndex: number,
  totalShards: number
) {
  if (specs.length < totalShards) {
    throw new Error(
      'More shards (' + totalShards + ') than test specs (' + specs.length + ')'
    );
  }

  // Just do a simple sharding strategy of dividing the number of specs
  // equally.
  var firstSpec = Math.floor((specs.length * shardIndex) / totalShards);
  var lastSpec = Math.floor((specs.length * (shardIndex + 1)) / totalShards);
  return specs.slice(firstSpec, lastSpec);
}

function getShardedSpecsToRun(specs: any[], clientConfig: Record<string, any>) {
  var shardIndex = clientConfig.shardIndex;
  var totalShards = clientConfig.totalShards;
  if (shardIndex != null && totalShards != null) {
    // Sharded mode - Run only the subset of the specs corresponding to the
    // current shard.
    return getSpecsToRunForCurrentShard(
      specs,
      Number(shardIndex),
      Number(totalShards)
    );
  }
}

/**
 * Create jasmine spec filter
 * @param {Object} clientConfig karma config
 * @param {!Object} jasmineEnv
 */
class KarmaSpecFilter {
  constructor(
    private clientConfig: Record<string, any>,
    private jasmineEnv: jasmine.Env
  ) {}
  /**
   * Walk the test suite tree depth first and collect all test specs
   * @param {!Object} jasmineEnv
   * @return {!Array<string>} All possible tests.
   */
  getAllSpecs(jasmineEnv: jasmine.Env) {
    var specs: (jasmine.Suite | jasmine.Spec)[] = [];
    var stack = [jasmineEnv.topSuite()];
    var currentNode: jasmine.Suite;
    while ((currentNode = stack.pop()!)) {
      if (currentNode.children) {
        // jasmine.Suite
        stack = stack.concat(currentNode.children as jasmine.Suite[]);
      } else if (currentNode.id) {
        // jasmine.Spec
        specs.unshift(currentNode);
      }
    }

    return specs;
  }

  /**
   * Filter the specs with URL search params and config.
   * @param {!Object} location property 'search' from URL.
   * @param {!Object} clientConfig karma client config
   * @param {!Object} jasmineEnv
   * @return {!Array<string>}
   */
  getSpecsToRun(
    location: Record<string, any>,
    clientConfig: Record<string, any>,
    jasmineEnv: jasmine.Env
  ) {
    var specs = this.getAllSpecs(jasmineEnv).map(function (spec) {
      (spec as any).name = spec.getFullName();
      return spec;
    });

    if (!specs || !specs.length) {
      return [];
    }

    return (
      getGrepSpecsToRun(clientConfig, specs) ||
      getDebugSpecToRun(location, specs) ||
      getShardedSpecsToRun(specs, clientConfig) ||
      specs
    );
  }

  specIdsToRun = this.getSpecsToRun(
    undefined as any,
    this.clientConfig,
    this.jasmineEnv
  ).map(getId);

  matches(spec: jasmine.Suite) {
    return this.specIdsToRun.indexOf(spec.id) !== -1;
  }
}

/**
 * Configure jasmine specFilter
 *
 * This function is invoked from the wrapper.
 * @see  adapter.wrapper
 *
 * @param {Object} config The karma config
 * @param {Object} jasmineEnv jasmine environment object
 */
var createSpecFilter = function (
  config: Record<string, any>,
  jasmineEnv: jasmine.Env
) {
  var karmaSpecFilter = new KarmaSpecFilter(config, jasmineEnv);

  var specFilter = function (spec: jasmine.Suite) {
    return karmaSpecFilter.matches(spec);
  };

  return specFilter;
};

/**
 * Karma starter function factory.
 *
 * This function is invoked from the wrapper.
 * @see  adapter.wrapper
 *
 * @param  {Object}   karma        Karma runner instance.
 * @param  {Object}   [jasmineEnv] Optional Jasmine environment for testing.
 * @return {Function}              Karma starter function.
 */
export function createStartFn(karma: KarmaClient, jasmineEnv: jasmine.Env) {
  // This function will be assigned to `window.__karma__.start`:
  return function () {
    var clientConfig = {
      args: [],
      useIframe: true,
      runInParent: false,
      captureConsole: true,
      clearContext: false,
      jasmine: {},
      originalArgs: [],
    };
    var jasmineConfig = clientConfig.jasmine || {};

    jasmineEnv = jasmineEnv || jasmine.getEnv();

    (jasmineConfig as any).specFilter = createSpecFilter(
      clientConfig,
      jasmineEnv
    );

    jasmineEnv.configure(jasmineConfig);

    jasmine.DEFAULT_TIMEOUT_INTERVAL =
      (jasmineConfig as any).timeoutInterval ||
      jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmineEnv.addReporter(new KarmaReporter(karma, jasmineEnv));
    jasmineEnv.execute();
  };
}

function indexOf(collection: any[], find: any, i?: number /* opt */) {
  if (collection.indexOf) {
    return collection.indexOf(find, i);
  }

  if (i === undefined) {
    i = 0;
  }
  if (i < 0) {
    i += collection.length;
  }
  if (i < 0) {
    i = 0;
  }
  for (var n = collection.length; i < n; i++) {
    if (i in collection && collection[i] === find) {
      return i;
    }
  }
  return -1;
}

function filter(collection: any[], filter: any, that?: any /* opt */) {
  if (collection.filter) {
    return collection.filter(filter, that);
  }

  var other: any[] = [];
  var v: any;
  for (var i = 0, n = collection.length; i < n; i++) {
    if (
      i in collection &&
      filter.call(that, (v = collection[i]), i, collection)
    ) {
      other.push(v);
    }
  }
  return other;
}

function map(
  collection: any[],
  mapper: (value: any, index: number, array: any[]) => any,
  that?: any /* opt */
) {
  if (collection.map) {
    return collection.map(mapper, that);
  }

  var other = new Array(collection.length);
  for (var i = 0, n = collection.length; i < n; i++) {
    if (i in collection) {
      other[i] = mapper.call(that, collection[i], i, collection);
    }
  }
  return other;
}
