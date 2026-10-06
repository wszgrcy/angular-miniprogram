import { transformMiniProgramStyle } from './mini-program-style';

const collectWarn = () => {
  const messages: string[] = [];
  return { messages, warn: (message: string) => messages.push(message) };
};

describe('builder/util/mini-program-style', () => {
  describe('@charset / @import 置顶', () => {
    it('@charset 提到最前（拼接后落在中间就是非法内容）', () => {
      expect(
        transformMiniProgramStyle(
          '.a{color:red}@charset "UTF-8";.b{color:blue}',
        ),
      ).toBe('@charset "UTF-8";.a{color:red}.b{color:blue}');
    });

    it('@charset 本来就在最前时不动', () => {
      const css = "@charset 'utf-8';.a{color:red}";
      expect(transformMiniProgramStyle(css)).toBe(css);
    });

    it('多条 @charset 只保留第一条', () => {
      expect(
        transformMiniProgramStyle('.a{color:red}@charset "a";@charset "b";'),
      ).toBe('@charset "a";.a{color:red}');
    });

    it('@import 提到最前', () => {
      expect(
        transformMiniProgramStyle(
          '.a{color:red}\n@import "./b.css";\n.c{color:blue}',
        ),
      ).toBe('@import "./b.css";.a{color:red}\n\n.c{color:blue}');
    });

    it('多条 @import 保持原有相对顺序', () => {
      expect(
        transformMiniProgramStyle(
          '.a{color:red}@import "./b.css";.c{color:blue}@import "./d.css";',
        ),
      ).toBe('@import "./b.css";@import "./d.css";.a{color:red}.c{color:blue}');
    });

    it('压缩吃掉的空格要补回来（支付宝不认 @import"x"）', () => {
      expect(transformMiniProgramStyle('.a{color:red}@import"./b.css";')).toBe(
        '@import "./b.css";.a{color:red}',
      );
    });

    it('带 media query 尾巴的 @import 整条搬走', () => {
      expect(
        transformMiniProgramStyle(
          '.a{color:red}@import url("./b.css") screen;',
        ),
      ).toBe('@import url("./b.css") screen;.a{color:red}');
    });

    it('注释里的 @import 不算数（注释先掩成等长空白）', () => {
      const css = '/* @import "./x.css"; */.a{color:red}';
      expect(transformMiniProgramStyle(css)).toBe(css);
    });

    it('什么都没有时原样返回', () => {
      const css = '.a{color:red}';
      expect(transformMiniProgramStyle(css)).toBe(css);
    });

    it('空样式原样返回', () => {
      expect(transformMiniProgramStyle('')).toBe('');
    });
  });

  describe('HTML 标签选择器告警', () => {
    it('给出模板里实际渲染成的标签', () => {
      const { messages, warn } = collectWarn();
      transformMiniProgramStyle('.a div{color:red}.b img{width:10px}', {
        warn,
      });
      expect(messages).toEqual([
        '样式里的 div 标签选择器在小程序里选不中任何元素（模板里渲染成 view），请改用 class 选择器',
        '样式里的 img 标签选择器在小程序里选不中任何元素（模板里渲染成 image），请改用 class 选择器',
      ]);
    });

    it('文件开头就是标签选择器也报', () => {
      const { messages, warn } = collectWarn();
      transformMiniProgramStyle('div{color:red}', { warn });
      expect(messages).toHaveLength(1);
    });

    it('@media 里标签紧跟 { 也报', () => {
      const { messages, warn } = collectWarn();
      transformMiniProgramStyle('@media screen{div{color:red}}', { warn });
      expect(messages).toHaveLength(1);
    });

    it('同一个标签只报一次', () => {
      const { messages, warn } = collectWarn();
      transformMiniProgramStyle('div{color:red}.a div{color:blue}', { warn });
      expect(messages).toHaveLength(1);
    });

    it('class / id / 属性选择器不报', () => {
      const { messages, warn } = collectWarn();
      transformMiniProgramStyle(
        '.div{color:red}#div{color:red}[data-div]{color:red}',
        { warn },
      );
      expect(messages).toEqual([]);
    });

    it('小程序同名组件不报', () => {
      const { messages, warn } = collectWarn();
      transformMiniProgramStyle('view{color:red}text{color:blue}', { warn });
      expect(messages).toEqual([]);
    });

    it('注释里的标签不报', () => {
      const { messages, warn } = collectWarn();
      transformMiniProgramStyle('/* div{} */.a{color:red}', { warn });
      expect(messages).toEqual([]);
    });

    it('keyframes 的 from / to 不当标签选择器', () => {
      const { messages, warn } = collectWarn();
      transformMiniProgramStyle('@keyframes x{from{opacity:0}to{opacity:1}}', {
        warn,
      });
      expect(messages).toEqual([]);
    });

    it('不传 warn 就什么都不做', () => {
      expect(() => transformMiniProgramStyle('div{color:red}')).not.toThrow();
    });
  });
});
