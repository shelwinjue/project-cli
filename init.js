#! /usr/bin/env node

import fs from 'fs';
import fsExtra from 'fs-extra';
import ora from 'ora';
import shell from 'shelljs';
import chalk from 'chalk';
import symbol from 'log-symbols';
import inquirer from 'inquirer';
import clone from './clone.js';

const remote =
  'https://github.com/shelwinjue/project-cli.git'; // 远端仓库地址
let branch = 'main';
const registry = 'https://registry.npmmirror.com'; // npm源

/**
 * 修改package.json，修改.husky/pre-commit
 * @param {string} directory 项目目录
 * @param {object} options
 * @param {string} options.huskyInstallStr package.json中husky的配置部分
 * @param {string} options.preCommitStr .husky/pre-commit中husky的配置部分
 */
function modifyHuskyConfig(directory, options) {
  let packageStr = fsExtra.readFileSync(`${directory}/package.json`, {
    encoding: 'utf8',
  });
  packageStr = packageStr.replace('${husky install}', options.huskyInstallStr);
  fsExtra.writeFileSync(`${directory}/package.json`, packageStr);

  let preCommitStr = fsExtra.readFileSync(`${directory}/.husky/pre-commit`, {
    encoding: 'utf8',
  });
  preCommitStr = preCommitStr.replace('${cd dir}', options.preCommitStr);
  fsExtra.writeFileSync(`${directory}/.husky/pre-commit`, preCommitStr);
}

async function initHusky(directory) {
  // console.log('++++directory');
  // console.log(directory);
  // 注意：git rev-parse --show-toplevel的执行结果，末尾是个换行符
  const result = shell.exec(`cd ${directory} && git rev-parse --show-toplevel`);
  // console.log(result);
  if (result.code !== 0) {
    console.log(
      symbol.error,
      chalk.yellow(
        '当前文件夹所在目录并不是一个git仓库，代码模板中的husky配置将无效，项目创建完成后，请手动检查并修改husky配置，确保修改正确后再执行pnpm install！'
      )
    );
    console.log(symbol.error, chalk.yellow(result.stderr));
    modifyHuskyConfig(directory, {
      huskyInstallStr: 'husky install',
      preCommitStr: '',
    });
  } else {
    const gitRoot = result.stdout.substring(0, result.stdout.length - 1);
    // console.log('+++ gitRoot');
    // console.log(gitRoot, gitRoot.length);

    if (directory !== gitRoot) {
      const other = directory.substring(gitRoot.length);
      // console.log('+++ other', other);
      const otherDirectory = other.substring(1);
      const directoryLevel = otherDirectory.split('/').length;
      const cdArr = [];
      for (let i = 0; i < directoryLevel; i++) {
        cdArr.push('..');
      }
      const cdStr = cdArr.join('/');
      // 修改package.json，修改.husky/pre-commit
      modifyHuskyConfig(directory, {
        huskyInstallStr: `cd ${cdStr} && husky install ${otherDirectory}/.husky`,
        preCommitStr: `cd ${otherDirectory}`,
      });
    } else {
      modifyHuskyConfig(directory, {
        huskyInstallStr: 'husky install',
        preCommitStr: '',
      });
    }
  }
}

export const initAction = async (name, option) => {
  // 检查控制台是否可运行git
  if (!shell.which('git')) {
    console.log(symbol.error, 'git命令不可用！');
    shell.exit(1); // 退出
  }

  if (name !== '.') {
    // 验证name输入是否合法
    if (name.match(/[^A-Za-z0-9_-]/g)) {
      console.log(symbol.error, '项目名称存在非法字符！');
      return;
    }
    // 验证name是否存在
    if (fs.existsSync(name) && !option.force) {
      console.log(symbol.error, `已存在项目文件夹${name}`);
      return;
    } else if (option.force) {
      // 强制覆盖
      const removeSpinner = ora(`${name}已存在，正在删除文件夹…`).start();
      try {
        fsExtra.removeSync(`./${name}`);
        removeSpinner.succeed(chalk.green('删除成功'));
      } catch (err) {
        console.log(err);
        removeSpinner.fail(chalk.red('删除失败'));
        return;
      }
    }
  }

  // 下载完毕后，定义自定义问题
  let questions = [
    {
      type: 'list',
      message: '请选择项目模板',
      name: 'template',
      choices: [
        { name: 'React + TS + React Router', value: 'React_TS_React_Router' },
      ],
    },
  ];
  // 通过inquirer获取用户输入的回答
  let answers = await inquirer.prompt(questions);
  // 将用户配置信息打印一下，确认是否正确
  console.log('---------------------');
  console.log(answers);

  const time = new Date().getTime();

  if (answers.template) {
    if (name === '.') {
      // fsExtra.emptyDirSync('.');
    } else {
      fsExtra.mkdirpSync(name);
    }

    // 下载模板
    await clone(`direct:${remote}`, `temp_${time}`, {
      clone: true,
    });

    

    // 复制模板
    const originFolder =
      answers.template === 'React_TS_React_Router'
        ? `temp_${time}/templates/React_TS_React_Router`
        : '';
    if (name === '.') {
      fsExtra.copySync(originFolder, '.');
    } else {
      fsExtra.copySync(originFolder, name);
    }
    const currentDirectory = shell.pwd().stdout.replaceAll('\\', '/');

    // initHusky(name === '.' ? currentDirectory : `${currentDirectory}/${name}`);
    
    let installSuccess = true;
    // 自动安装依赖
    const installSpinner = ora('正在安装依赖…').start();
    if (name == '.') {
      if (
        shell.exec(`npm config set registry ${registry} && pnpm install`)
          .code !== 0
      ) {
        installSuccess = false;
        console.log(symbol.error, chalk.yellow('自动安装依赖失败，请手动安装'));
      }
    } else {
      if (
        shell.exec(
          `cd ${shell.pwd()}/${name} && npm config set registry ${registry} && pnpm install`
        ).code !== 0
      ) {
        installSuccess = false;
        console.log(symbol.error, chalk.yellow('自动安装依赖失败，请手动安装'));
      }
    }
    if (installSuccess) {
      installSpinner.succeed(chalk.green('依赖安装完成'));
    }

    fsExtra.removeSync(`temp_${time}`);

    installSpinner.succeed(chalk.green('项目创建完成'));
  }

  return;
};
