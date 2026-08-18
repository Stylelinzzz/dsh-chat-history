# dsh-chat-history

DeepSeek Harness 会话头部「目录」tab：把当前会话的**用户消息历史**整理成可点击的目录，点击任意条目即可跳回聊天视图并定位到对应消息。

- 自动生成：只收录用户真正提出的问题（`user` 消息），过滤 Tool / Thinking / Command / 注入上下文等噪音，长 Agent 会话也能保持导航价值。
- 自动翻页：tab 激活时自动连续加载更早历史（每页 50 条）直到整个会话日志进入客户端窗口，目录完整、无需手动翻聊天区。
- 点击跳转：切回「对话」tab → 平滑滚动到目标消息 → 1.5s 高亮闪烁。
- 零冲突：注册为 `conversation.view` 槽位的会话 tab（与官方「轨迹」tab 并列），**不占用** `details` 槽位，官方"点击工具调用看输入/输出详情"面板完全不受影响。

## 安装

```bash
# 在 profile 中安装（例如 web）
dsh plugin --profile web add dsh-chat-history
```

重启 `dsh web` 后，打开任一会话，会话头部标签栏出现「对话 / 轨迹 / 目录」，点「目录」即可使用。

## 使用

1. 打开一个会话，点击头部「目录」tab。
2. 目录按消息顺序列出全部用户消息（编号 + 单行截断标题，hover 显示完整内容）。
3. 顶部显示加载状态：历史未加载完时显示「正在加载更早的历史…」，加载完显示总条数。
4. 点击任意条目 → 自动切回「对话」tab，滚动定位并高亮对应消息。

## 开发

- 纯 client 插件：`window.__ModuleLoader__.load({ id, factory })` 手写 bundle，无需构建工具。
- 改 `lib/client.js` 内容后**无需重启**：profile 自带的 `client-hmr` 每 500ms stat 轮询 bundle，文件变化自动热更新（约 1 秒生效）。
- 改 `package.json` 的 `dsh.client` 声明、新增插件、改 `cordis.patch.yml` 启用状态时**需要重启** `dsh web`。

## 机制要点

- 目录数据源：会话快照 `s.chat.order` + `s.chat.nodes.get(key)`，过滤 `kind === "user"`。
- DOM 定位：ui-conversation 已给每个消息节点打 `data-chat-anchor-key`，直接按 key 查询即可。
- 分页：`session.loadOlder()` 每页 50 条，`hasMore` / `loadingOlder` 驱动自动翻页，连续 3 次无新节点即停止（防 host 异常死循环）。
- 跳转：tab 激活时只渲染 active view，故先模拟点击「对话」tab 切回聊天，再轮询目标 DOM 出现后 `scrollIntoView` + 高亮。

## License

MIT
