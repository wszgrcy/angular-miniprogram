import cp from 'child_process';

export async function cloneSpecifiedDir(options: {
  savePath: string;
  source: string;
  branch: string;
  subDir: string;
}) {
  cp.spawnSync('rm', ['-rf', options.savePath]);
  const gitClone = cp.spawn(
    'git',
    [
      'clone',
      '--filter=blob:none',
      '--no-checkout',
      '--sparse',
      options.source,
      '--depth',
      '1',
      '--branch',
      options.branch,
      options.savePath,
    ],
    {}
  );
  await new Promise((res) => {
    gitClone.on('close', (code) => {
      res(undefined);
    });
  });
  cp.spawnSync('git', ['sparse-checkout', 'set', options.subDir], {
    cwd: options.savePath,
  });
  cp.spawnSync('git', ['checkout'], { cwd: options.savePath });
}
