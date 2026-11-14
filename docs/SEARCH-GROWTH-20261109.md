# I-PACK 搜索与询盘增长执行记录

## 2026-11-14 续作：指南内链与转化路径

本次沿用 PR16 的目录静态采购入口、博客摘要和 sitemap 日期修正继续优化；以下为本地实现与检查记录，尚未表示已部署或已产生增长。2026-11-09 原始记录保留在下方作为历史基线。

- 修复 18 篇静态指南的目录路由、面向内部的关键词导语和相关指南入口；blog 索引由 10 篇补齐至 18 篇。重点 headlamp 指南连接真实 headlights 分类、`/product?category=headlights` 和 `/contact` RFQ，分类页提供反向指南链接。
- 8 个分类页修正 Breadcrumb 目录路由及面向内部的 SEO 标题；移除 Fortuner 指南中没有真实详情地址的占位商品卡。仅更新实际修改页的 sitemap 日期，指南可见更新日期与 Article `dateModified` 保持一致；弱化旧文中的绝对适配保证，不把 OE 匹配工具视为适配保证。
- GSC 索引报告更新于 2026-11-09，本次读取 152 条“已发现但未编入索引”完整表：products 65、oe 34、vehicles 21、blog 14、categories 4、solutions 5、news 1、other 8。该组包含多种页面，不能把全部 152 条归因于产品目录的客户端渲染。
- GA4 2026-10-17 至 2026-11-13 返回 27 次 `whatsapp_click`、7 次 `form_submit`，12 类事件中未返回 `generate_lead`；WhatsApp 点击是联系意向，不等于收到或有效询盘，通用表单事件也不作为接口成功证据。数据库按 Asia/Shanghai 同周期统计入库询盘为 0，历史共 3 条，最新记录为 2026-10-13。GA4 属性时区尚未独立核实。
- 产品目录 SSR/构建时渲染保持待证据评估：先取得 Google Search Console 实时网址测试的呈现 HTML/截图，核对真实产品链接是否可见。初始 HTML 网格为空，以及页面处于“已发现”状态，都不足以证明 SSR 是当前必要修复。
- 本地检查：`node scripts/check-guide-seo.cjs`、`node scripts/check-articles.cjs`、`node tools/check-product-directory.cjs`、`node tools/check-product-directory.mjs` 及 `git diff --check` 已通过。浏览器预览、独立复验和部署验证另行记录。

数据来源：项目 `04_验证记录/seo-growth-20261114/baseline.json`（观察日期 2026-11-14）。未在基线采集中提交生产测试询盘。

## 2026-11-09 第一批历史记录

第一批改动；不代表已上线或已增加流量。

## 已核实

- main 提交 badf45ec4fb544f8fe949a78aed5720c3fe0c7cc。
- 线上 robots.txt、sitemap.xml、sitemap-catalog.xml、sitemap-articles.xml 和 api/catalog 均返回 HTTP 200；站点地图返回 XML，产品接口返回 JSON。
- robots.txt 使用 User-agent: * / Allow: /，已允许搜索抓取；无需为 AI 重复添加允许规则。
- product.html 初始 HTML 产品网格为空，通过接口加载。不能据此断言 Google 无法收录；需 Search Console 实时测试渲染。
- GA4 代码中已配置 G-4FC1Y4G5ZN，存在 generate_lead 事件；尚未验证数据接收、账户所有权、去重和业务入库全链路。
- 博客列表有 10 条对外展示 Target keyword 的内部文案。

## 本批改动

1. 用采购摘要替换 10 条内部关键词文案。
2. 产品目录新增初始 HTML 可见的车型和采购指南链接，独立于产品接口加载；未声称任何具体产品已核实适配。
3. 移除站点地图索引中不准确的固定子地图修改日期；只更新实际修改的 blog/product 页面日期。
4. 保留现有接口、询盘逻辑、分析编号、robots 和页面布局体系。

## 运营小白操作：先取得真实基线

### Google Search Console

1. 打开 https://search.google.com/search-console ，使用公司可长期管理的 Google 账户。
2. 若已有该站资产，先检查现有资产，避免重复设置。若无，添加“网域”ipackautoparts.com。
3. 按 Google 生成的 TXT 值在域名 DNS 服务商新增记录；不要删除现有邮箱或网站记录。TXT 必须使用账号实时生成的值。
4. 验证后在“站点地图”提交 https://www.ipackautoparts.com/sitemap.xml 。记录提交结果和发现网址数。
5. 在“网址检查”分别检查首页、/product，以及 sitemap-catalog.xml 内一个真实产品地址。点击“测试实际网址”，查看能否抓取、是否允许编入索引、呈现 HTML 是否包含真实产品信息。
6. 正式上线后，对已修复重点页面请求编入索引。提交不保证收录，不需要每天重复提交。
7. 导出近 28 天搜索效果和网页索引数据。记录非品牌搜索曝光、点击、CTR、查询、国家及落地页；不要用 site: 搜索数量代替索引报告。

### Google Analytics 4

1. 打开 https://analytics.google.com ，确认网站数据流编号为 G-4FC1Y4G5ZN；不要另建编号替换已有数据流。
2. 打开“实时”，访问网站；受同意设置影响时，按页面提示选择后再验证。
3. 点击一次 WhatsApp、查看一个产品、提交一次明确标注为测试的询盘。提交测试会产生业务记录，应由负责人协调完成。
4. 核对事件、后台询盘及业务接收情况。成功提交只能在接口确认成功后计为 generate_lead；按钮点击不能当询盘。
5. 将成功询盘事件设为关键事件。WhatsApp 点击单独记录，真正有效询盘由业务确认。
6. 用来源/媒介和落地页查看 Google、Bing、ChatGPT 等来源；AI 引荐和品牌被提及分别统计。

### Bing 与其他搜索入口

1. 在 https://www.bing.com/webmasters 添加或从已验证 Google 资产导入网站。
2. 提交同一 sitemap.xml，检查抓取、索引及错误情况。
3. 后续再评估后台发布/更新时发送 IndexNow；先确保规范地址、发布状态、密钥文件和删除逻辑正确，勿提交后台或草稿网址。
4. 统一国际站、企业社媒及合作伙伴中的公司名称、网址与联系方式；只提交真实业务资料，避免群发外链和虚假评价。

## 下一批开发与验收

| 优先级 | 工作 | 验收 |
| --- | --- | --- |
| 待证据（原 P0） | 先取得 Google 实时渲染证据，再决定是否为目录增加服务端或构建时产品内容及可抓取分页 | 核对呈现 HTML 是否包含真实产品链接；若实施，再验收独立翻页 URL、过滤重复索引控制及未发布产品不暴露 |
| P0 | 核对动态产品详情、站点地图和状态码 | 仅发布产品入地图；规范地址一致；不存在/下架页面正确处理；无虚构 Product/Offer 数据 |
| P0 | 询盘提交、入库、通知及 GA4 去重 | 一次测试成功对应一条询盘；失败不计成功；不向分析发送联系方式或询盘正文 |
| P1 | Prius 灯具和灯罩优先页面 | 型号/年份/市场/左右侧/接口/OE 区分已核与待核；真实图；清晰询盘入口 |
| P1 | 审核现有相似博客 | 每篇有独特采购价值；合并重复内容并规划重定向；无编造适配、认证或库存 |
| P1 | 移动端性能 | 用 PageSpeed Insights 记录代表页面基线再针对瓶颈改动；不承诺无实测分数 |
| P2 | 原创案例和行业引用 | 有真实检验图、包装图或采购案例及来源；不购买垃圾外链 |

## 复盘表

每周同一时间记录：日期、Google 非品牌曝光、点击、CTR、有效落地页、搜索来源询盘、业务认定有效 B2B 询盘、有效询盘率、AI 引荐访问、AI 引荐有效询盘。有效询盘率分母使用相同口径会话；同时保留原始人数，低样本不下结论。

以 28 天滚动窗口比较；保留改动日期。收录、排名和 AI 推荐均无法保证，不能把自然波动直接归因于本批修改。

## 官方依据

- Google AI 搜索：https://developers.google.com/search/docs/appearance/ai-features
- 可抓取链接：https://developers.google.com/search/docs/crawling-indexing/links-crawlable
- JavaScript SEO：https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- Search Console：https://support.google.com/webmasters/answer/9128668
- OpenAI 搜索抓取：https://developers.openai.com/api/docs/bots

OAI-SearchBot 面向搜索，GPTBot 面向训练，二者独立。开放抓取不保证被引用。Google AI 搜索无需专用 AI 文件或特殊 schema；优先做好可抓取性、准确内容与真实业务证据。
