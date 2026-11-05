#! /usr/bin/env node
// 必须在文件头添加如上内容指定运行环境为node
import { initAction, initAgentAction } from './init.js';
import { Command } from 'commander';
const program = new Command();



// 创建项目命令
program
  .command('create <name>') // 定义create子命令，<name>为必需参数，可在action的function中接收；如果需要设置为非必需参数，可使用[]
  .option('-f, --force', '强制覆盖本地同名项目') // 配置参数
  .description('使用脚手架创建项目') // 命令描述说明
  .action(initAction); // 执行函数

program
  .command('create-agent [name]')
  .option('--git-url <url>', '远程 Git 仓库地址')
  .description('创建 NestJS + Mastra Agent 项目')
  .action(initAgentAction);

// 利用commander解析命令行输入，必须写在所有内容最后面
program.parse();
