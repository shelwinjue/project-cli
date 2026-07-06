#! /usr/bin/env node

import fs from 'fs';
import fsExtra from 'fs-extra';
import ora from 'ora';
import shell from 'shelljs';
import chalk from 'chalk';
import symbol from 'log-symbols';
import inquirer from 'inquirer';
import clone from './clone.js';

const remote = 'https://github.com/shelwinjue/project-cli.git'; // 远端仓库地址
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
    encoding: 'utf8'
  });
  packageStr = packageStr.replace('${husky install}', options.huskyInstallStr);
  fsExtra.writeFileSync(`${directory}/package.json`, packageStr);

  let preCommitStr = fsExtra.readFileSync(`${directory}/.husky/pre-commit`, {
    encoding: 'utf8'
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
        '当前文件夹所在目录并不是一个git仓库，husky配置未生效，请git init之后执行npm run prepare！'
      )
    );
  } else {
  }
}

export const initAction = async (name, option) => {
  if (!shell.which('pnpm')) {
    console.log(
      symbol.error,
      'pnpm命令不可用，请先安装pnpm，执行npm install -g pnpm'
    );
    shell.exit(1); // 退出
  }
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

  // 确定默认的部署应用名称
  const defaultAppName =
    name === '.'
      ? shell.pwd().stdout.replaceAll('\\', '/').split('/').pop()
      : name;

  // 让用户确认部署应用名称
  let appNameQuestions = [
    {
      type: 'input',
      message: '请输入部署应用名称',
      name: 'appName',
      default: defaultAppName
    }
  ];
  let appNameAnswers = await inquirer.prompt(appNameQuestions);
  const appName = appNameAnswers.appName;

  if (appName.match(/[^a-z0-9_-]/g)) {
    console.log(
      symbol.error,
      '应用名称存在非法字符！请确保只包含小写字母、数字、下划线和中划线'
    );
    return;
  }

  // 让用户输入远程git仓库url
  let gitUrlQuestions = [
    {
      type: 'input',
      message: '请输入远程git仓库地址',
      name: 'gitUrl',
      default: '',
      validate: (input) => {
        if (!input) return 'git仓库地址不能为空';
        if (!/^https?:\/\/.+/.test(input)) {
          return '请输入合法的git仓库地址（以 http:// 或 https:// 开头）';
        }
        return true;
      }
    }
  ];
  let gitUrlAnswers = await inquirer.prompt(gitUrlQuestions);
  const gitUrl = gitUrlAnswers.gitUrl;

  // 下载完毕后，定义自定义问题
  let questions = [
    {
      type: 'list',
      message: '请选择项目模板',
      name: 'template',
      choices: [
        { name: 'React + TS + React Router', value: 'React_TS_React_Router' },
        {
          name: 'Vite + TS + React + React Router',
          value: 'Vite_TS_React_Router'
        }
      ]
    }
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
      clone: true
    });

    // 复制模板
    const originFolder = `temp_${time}/templates/${answers.template}`;
    if (name === '.') {
      fsExtra.copySync(originFolder, '.');
    } else {
      fsExtra.copySync(originFolder, name);
    }
    const currentDirectory = shell.pwd().stdout.replaceAll('\\', '/');

    // 如果是 Vite 模板，根据 appName 设置 base
    if (answers.template === 'Vite_TS_React_Router') {
      const targetDir = name === '.' ? '.' : name;
      const targetPath = `${currentDirectory}/${targetDir}`;

      // 替换 vite.config.ts 中的 ${APP_NAME}
      const viteConfigPath = `${targetPath}/vite.config.ts`;
      if (fsExtra.existsSync(viteConfigPath)) {
        let viteConfigContent = fsExtra.readFileSync(viteConfigPath, 'utf8');
        viteConfigContent = viteConfigContent.replaceAll(
          '${APP_NAME}',
          appName
        );
        fsExtra.writeFileSync(viteConfigPath, viteConfigContent);
      }

      // 替换 deploy 目录下所有文件中的 ${APP_NAME}
      const deployDir = `${targetPath}/deploy`;
      if (fsExtra.existsSync(deployDir)) {
        // 先替换 Jenkinsfile 中的 GIT_URL
        const jenkinsfilePath = `${deployDir}/Jenkinsfile`;
        if (fsExtra.existsSync(jenkinsfilePath) && gitUrl) {
          let jenkinsContent = fsExtra.readFileSync(jenkinsfilePath, 'utf8');
          jenkinsContent = jenkinsContent.replace(
            "'https://gitlab.zhejianglab.com/research-center-for-data-hub-and-security/platform/frontend/${APP_NAME}.git'",
            `'${gitUrl}'`
          );
          fsExtra.writeFileSync(jenkinsfilePath, jenkinsContent);
        }

        // 再替换所有文件中的 ${APP_NAME}
        function replaceAppName(dir) {
          const files = fsExtra.readdirSync(dir);
          files.forEach((file) => {
            const filePath = `${dir}/${file}`;
            const stat = fsExtra.statSync(filePath);
            if (stat.isDirectory()) {
              replaceAppName(filePath);
            } else {
              let content = fsExtra.readFileSync(filePath, 'utf8');
              if (content.includes('${APP_NAME}')) {
                content = content.replaceAll('${APP_NAME}', appName);
                fsExtra.writeFileSync(filePath, content);
              }
            }
          });
        }
        replaceAppName(deployDir);
      }
    }

    let installSuccess = true;
    // 自动安装依赖
    const installSpinner = ora('正在安装依赖…').start();
    try {
      if (name == '.') {
        if (
          shell.exec(`npm config set registry ${registry} && pnpm install`)
            .code !== 0
        ) {
          installSuccess = false;
          console.log(
            symbol.error,
            chalk.yellow('自动安装依赖失败，请手动安装')
          );
        }
      } else {
        if (
          shell.exec(
            `cd ${shell.pwd()}/${name} && npm config set registry ${registry} && pnpm install`
          ).code !== 0
        ) {
          installSuccess = false;
          console.log(
            symbol.error,
            chalk.yellow('自动安装依赖失败，请手动安装')
          );
        }
      }
    } catch (err) {}

    if (installSuccess) {
      installSpinner.succeed(chalk.green('依赖安装完成'));
    }

    fsExtra.removeSync(`temp_${time}`);

    installSpinner.succeed(chalk.green('项目创建完成'));

    initHusky(name === '.' ? currentDirectory : `${currentDirectory}/${name}`);
  }

  return;
};
