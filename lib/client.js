window.__ModuleLoader__.load({
	id: "dsh-chat-history",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		//#region styles
		const css = ".dsh-toc-root{box-sizing:border-box;height:100%;min-height:0;color:var(--dsw-alias-label-primary);flex-direction:column;display:flex;overflow:hidden}.dsh-toc-header{border-bottom:1px solid var(--dsw-alias-border-l2);flex:none;padding:14px 28px 10px 20px;font-size:14px;font-weight:500;line-height:20px}.dsh-toc-sub{color:var(--dsw-alias-label-tertiary);font-size:12px;font-weight:400;line-height:18px;margin-left:8px}.dsh-toc-list{flex:1;min-height:0;padding:8px 20px;overflow-y:auto;--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2)}.dsh-toc-empty{color:var(--dsw-alias-label-tertiary);padding:16px 20px;font-size:13px;line-height:20px}.dsh-toc-loading{color:var(--dsw-alias-label-tertiary);padding:10px 20px;font-size:12px;line-height:18px}.dsh-toc-item{box-sizing:border-box;min-width:0;width:100%;color:var(--dsw-alias-label-secondary);text-align:left;cursor:pointer;background:transparent;border:none;border-radius:8px;align-items:baseline;gap:8px;padding:6px 8px;display:flex}.dsh-toc-item:hover{background:var(--dsw-alias-interactive-bg-hover)}.dsh-toc-item:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:-2px}.dsh-toc-item.dsh-toc-active{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);box-shadow:inset 2px 0 0 var(--dsw-alias-state-business-primary)}.dsh-toc-num{color:var(--dsw-alias-label-caption);flex:none;font-size:12px;line-height:20px;min-width:16px}.dsh-toc-text{min-width:0;text-overflow:ellipsis;white-space:nowrap;overflow:hidden;font-size:13px;line-height:20px}[data-history-flash]{box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-state-business-primary) 40%,transparent)}";
		const tagId = "dsh-chat-history/toc.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-chat-history";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		//#endregion
		//#region locales
		/** Dictionary namespace owned by this plugin. */
		const NS = "chat-history";
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = {
			"view.toc": "目录",
			"toc.title": "对话目录",
			"toc.empty": "暂无对话记录",
			"toc.loading": "正在加载更早的历史…",
			"toc.count": "共 {count} 条"
		};
		/** English dictionary, checked complete against the zh key set. */
		const en = {
			"view.toc": "History",
			"toc.title": "Chat History",
			"toc.empty": "No messages yet",
			"toc.loading": "Loading earlier history…",
			"toc.count": "{count} entries"
		};
		//#endregion
		//#region helpers
		/** Find the DOM row bound to one chat node key (ui-conversation stamps data-chat-anchor-key). */
		function anchorElement(key) {
			for (const el of document.querySelectorAll("[data-chat-anchor-key]")) {
				if (el.dataset.chatAnchorKey === key) return el;
			}
			return null;
		}
		/** Switch back to the Chat view tab by simulating a click on its tab button
		*  (the tab bar lives in ui-conversation's session header; chat is the
		*  `chat` view with label 对话 / Chat). Returns whether a button was found. */
		function switchToChatTab() {
			const tabs = document.querySelectorAll('[role="tab"]');
			for (const tab of tabs) {
				const text = (tab.textContent ?? "").trim();
				if (text === "对话" || text === "Chat") {
					tab.click();
					return true;
				}
			}
			const first = tabs[0];
			if (first !== void 0) {
				first.click();
				return true;
			}
			return false;
		}
		/** Short title from a user-message node: text blocks, whitespace collapsed, 48 chars. */
		function messageTitle(data) {
			if (data === void 0 || typeof data !== "object") return "";
			const content = data.content;
			if (!Array.isArray(content)) return "";
			const text = content
				.filter((block) => block !== null && typeof block === "object" && block.type === "text" && typeof block.text === "string")
				.map((block) => block.text)
				.join(" ")
				.replace(/\s+/g, " ")
				.trim();
			if (text === "") return "";
			return text.length > 48 ? text.slice(0, 48) + "…" : text;
		}
		//#endregion
		//#region TocPanel
		/** The chat-history directory as a conversation view tab. While the tab is
		*  active it auto-pages older history until the whole session log is in the
		*  client window (so the directory is complete, not just the already-loaded
		*  tail), and clicking a row switches back to the Chat view, waits for the
		*  target message DOM, smooth-scrolls it into view, and flashes it. */
		function TocPanel({ useSession, loadOlderPage, t }) {
			const order = useSession((snapshot) => snapshot.chat.order);
			const nodes = useSession((snapshot) => snapshot.chat.nodes);
			const hasMore = useSession((snapshot) => snapshot.hasMore);
			const loadingOlder = useSession((snapshot) => snapshot.loadingOlder);
			const items = react.useMemo(() => {
				const out = [];
				for (const key of order) {
					const node = nodes.get(key);
					if (node === void 0 || node.kind !== "user") continue;
					const title = messageTitle(node.data);
					if (title === "") continue;
					out.push({ key, title });
				}
				return out;
			}, [order, nodes]);
			const flashTimerRef = react.useRef(null);
			react.useEffect(() => () => {
				if (flashTimerRef.current !== null) clearTimeout(flashTimerRef.current);
			}, []);
			/** Auto-page: while the tab is mounted and more history exists, keep
			*  pulling older pages. The session's loadOlder guard (open && hasMore &&
			*  !loadingOlder) makes this safe to call whenever the effect re-runs;
			*  we additionally bail after 3 no-progress pages so a stuck host cannot
			*  loop forever. */
			const stallRef = react.useRef(0);
			react.useEffect(() => {
				if (!hasMore || loadingOlder) return;
				if (stallRef.current >= 3) return;
				let cancelled = false;
				loadOlderPage().then((progress) => {
					if (cancelled) return;
					stallRef.current = progress ? 0 : stallRef.current + 1;
				});
				return () => {
					cancelled = true;
				};
			}, [hasMore, loadingOlder, loadOlderPage]);
			const jump = (item) => {
				if (flashTimerRef.current !== null) clearTimeout(flashTimerRef.current);
				switchToChatTab();
				const started = performance.now();
				const probe = () => {
					const el = anchorElement(item.key);
					if (el !== null) {
						el.setAttribute("data-history-flash", "");
						el.scrollIntoView({ behavior: "smooth", block: "start" });
						flashTimerRef.current = setTimeout(() => {
							el.removeAttribute("data-history-flash");
							flashTimerRef.current = null;
						}, 1500);
						return;
					}
					if (performance.now() - started > 4000) return;
					requestAnimationFrame(probe);
				};
				requestAnimationFrame(probe);
			};
			return react.createElement(
				"div",
				{ className: "dsh-toc-root" },
				react.createElement(
					"div",
					{ className: "dsh-toc-header" },
					t("toc.title"),
					react.createElement("span", { className: "dsh-toc-sub" }, hasMore ? t("toc.loading") : t("toc.count", { count: String(items.length) }))
				),
				items.length === 0 && !hasMore
					? react.createElement("div", { className: "dsh-toc-empty" }, t("toc.empty"))
					: react.createElement(
						"div",
						{ className: "dsh-toc-list" },
						items.map((item, index) =>
							react.createElement(
								"button",
								{
									key: item.key,
									type: "button",
									className: "dsh-toc-item",
									title: item.title,
									onClick: () => jump(item)
								},
								react.createElement("span", { className: "dsh-toc-num" }, String(index + 1)),
								react.createElement("span", { className: "dsh-toc-text" }, item.title)
							)
						),
						hasMore && react.createElement("div", { className: "dsh-toc-loading" }, t("toc.loading"))
					)
			);
		}
		//#endregion
		//#region apply
		/** Services required by the plugin fiber. */
		const inject = ["slots", "sessions", "locale"];
		/** Mount the plugin: register the directory as a conversation view tab
		*  (id "toc") once ui-conversation declares the conversation.view slot. */
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "dsh-chat-history: dictionaries");
			const t = ctx.locale.bind(NS);
			ctx.effect(() => ctx.slots.inject("conversation.view", () => ctx.slots.register({
				name: "conversation.view",
				id: "toc",
				order: 20,
				locale: NS,
				label: () => t("view.toc"),
				inject: (sessionId) => {
					const session = ctx.sessions.binding(sessionId)?.session;
					if (session === void 0) return {};
					return {
						/** Pull one older page; resolves true when new nodes landed. */
						loadOlderPage: async () => {
							const before = session.getSnapshot().chat.order.length;
							await session.loadOlder();
							return session.getSnapshot().chat.order.length > before;
						}
					};
				}
			}, TocPanel)), "dsh-chat-history: conversation view tab");
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
