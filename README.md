# Snake

Project repository for Snake.
（以git flow流程）分支（git branch）可以在保障主干main稳定的基础上，从一次（主干main 或 一个feature......）commit向外进行开发新功能，发布新版本（realise），或线上紧急修bug（hotfix）。
合并（git merge）就是将git branch产生的当前目标分支合并回主干（或上级分支）完成主干（或上级分支）的功能改变。
参考视频：https://www.bilibili.com/video/BV1ySLc6QEcB/?spm_id_from=333.1007.top_right_bar_window_history.content.click&vd_source=0ceb11dc3ba6ede32e64a0765f3e0148
1.cd:有点像我的世界里的传送，在git bash里可以进入文件
2.ls:list  可以将文件里的内容列出来
3.mkdir 创建文档
错误信息：之前vs出现代码没有问题但是报错的问题，而豆包给出了“因为输入了中文的双引号导致编译出错”，在结合之前出现过的问题查证后为utf-8编译中文时的常规乱码错误。