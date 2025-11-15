* v0 生成的前端 UI 调用的 `/lib/api/admin.ts`、`/lib/api/agent.ts`
* 在 Cursor 里都能被替换成真实的 Next.js API Route + Supabase 逻辑
* 整套“统一文本语料工厂”流水线能真正跑起来

---

# 语料工厂后端 / 全栈 PRD（给 Cursor）

## 0. 项目概述 & 目标

### 0.1 项目名称

**Unified Text Corpus Factory / 语料机器人流水线平台**

### 0.2 总体目标

在现有的 **Next.js + Supabase + v0 前端 UI** 的基础上，实现一套完整可用的后端逻辑，使系统具备：

* 支持多源的“统一文本语料工厂”：
  视频、音频、PDF 文档、网页、社交内容（Twitter 等）
* 把上游多模态数据统一归一成文本：
  `CorpusItem → Text → Segments → Embeddings → RAG 问答`
* 提供稳定的 REST/HTTP API：

  * `/api/admin/**`：给 Admin 前端用
  * `/api/agent/**`：给 Agent 问答前端用

**前提：**

* Supabase 已存在（Postgres + pgvector 可开）
* v0 负责的前端已经有 `lib/api/admin.ts`、`lib/api/agent.ts`，目前用 mock 实现

**本 PRD 的目标：**

> 指导 Cursor：
>
> 1. 设计/创建数据库 schema（Supabase migrations）
> 2. 实现 Next.js API Route
> 3. 把前端的 mock API 替换为真实调用
> 4. 实现一个基础可用的 RAG 问答（只用简单的过滤）

---

## 1. 技术架构与环境

### 1.1 技术栈

* **前端**（已由 v0 生成）：

  * Next.js 14 App Router + TypeScript
  * Tailwind + shadcn/ui

* **后端**：

  * Next.js App Router 中的 Route Handlers：`app/api/**/route.ts`
  * 运行环境：Node.js（由 Vercel 或其他环境提供）

* **数据库**：

  * Supabase Postgres
  * pgvector 扩展（用于存 `segment_embeddings`）

* **外部服务（可配置）**：

  * Embedding：OpenAI Embeddings / 其他兼容服务
  * LLM：OpenAI Chat / 其他兼容服务
  * （暂不强制实现 ASR / PDF 解析，只预留接口）

### 1.2 环境变量约定（放到 `.env.local`）

```env
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...  # 后端用（注意不要泄露给前端）

# 向量 & LLM 提供方
AI_EMBEDDING_MODEL=...
AI_EMBEDDING_API_KEY=...
AI_LLM_MODEL=...
AI_LLM_API_KEY=...
```

要求：

* 所有服务调用封装在 `lib/server/` 或类似目录中，不在组件里直接读这些环境变量。
* 前端只使用公共 Supabase Key（如果用到），敏感 Key 只在 server 端使用。

---

## 2. 数据库 Schema 设计（Supabase）

建议用 SQL migration（可以让 Cursor 生成 `supabase/migrations/...` 的 SQL 文件）。

### 2.1 entities（实体/人物）

```sql
create table public.entities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### 2.2 sources（数据源）

```sql
create table public.sources (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid references public.entities(id) on delete set null,
  name text not null,
  kind text not null,          -- 'video' | 'audio' | 'document' | 'web_page' | 'social'
  origin_type text not null,   -- 'youtube' | 'pdf_upload' | 'web_url' | 'twitter' | ...
  config jsonb not null default '{}'::jsonb,  -- 数据源具体配置，比如 playlistId, rssUrl, 等
  config_summary text,         -- 方便在前端展示一个简短描述
  enabled boolean not null default true,
  last_ingest_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### 2.3 corpus_items（统一语料项）

```sql
create table public.corpus_items (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid references public.entities(id) on delete set null,
  source_id uuid references public.sources(id) on delete set null,
  content_kind text not null,    -- 'video' | 'audio' | 'document' | 'web_page' | 'social'
  origin_type text not null,     -- 'youtube' | 'pdf_upload' | 'web_url' | 'twitter' | ...
  title text not null,
  description text,
  primary_url text,              -- 原始链接，比如 youtube url / pdf url
  language text not null default 'en',
  published_at timestamptz,
  status text not null default 'pending', -- 'pending' | 'text_imported' | 'segments_ready' | 'embedded' | 'failed'
  reliability_level int,         -- 1-5 权威度
  status_reason text,            -- 失败原因等
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### 2.4 transcripts（规范化全文）

> 表示某个 corpus_item 的“统一文本版本”，可以来自 ASR、PDF 抽取、网页正文等。

```sql
create table public.transcripts (
  id uuid primary key default gen_random_uuid(),
  corpus_item_id uuid references public.corpus_items(id) on delete cascade,
  provider text not null,        -- 'asr', 'pdf_extract', 'manual', ...
  language text not null default 'en',
  raw_text text,                 -- 可选，保存全文文本
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### 2.5 transcript_segments（转录分段 / 文本分段）

> 上游文本分成小块：
> 对视频/音频：start_sec/end_sec 代表时间
> 对 PDF/网页：可以用 page/paragraph 存在 meta 里；start_sec/end_sec 可为 null。

```sql
create table public.transcript_segments (
  id uuid primary key default gen_random_uuid(),
  transcript_id uuid references public.transcripts(id) on delete cascade,
  position_index int not null,           -- 在 transcript 中的顺序
  start_sec numeric(10,3),               -- 可为空
  end_sec numeric(10,3),                 -- 可为空
  text text not null,
  meta jsonb not null default '{}'::jsonb, -- 可放 page_index、chapter 等
  created_at timestamptz not null default now()
);

create index on public.transcript_segments (transcript_id, position_index);
```

### 2.6 segments（切块后的索引片段）

```sql
create table public.segments (
  id uuid primary key default gen_random_uuid(),
  corpus_item_id uuid references public.corpus_items(id) on delete cascade,
  transcript_id uuid references public.transcripts(id) on delete cascade,
  start_position_index int,             -- 覆盖的 transcript_segments 起始 index
  end_position_index int,
  start_sec numeric(10,3),              -- 对于视频/音频，有值
  end_sec numeric(10,3),
  text text not null,                   -- 清洗后的文本，适合做 embedding
  language text not null default 'en',
  meta jsonb not null default '{}'::jsonb, -- 比如包含原 segment_ids 或 page/paragraph 信息
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.segments (corpus_item_id);
```

### 2.7 segment_embeddings（向量）

确保已启用 pgvector。

```sql
create extension if not exists vector;

create table public.segment_embeddings (
  id uuid primary key default gen_random_uuid(),
  segment_id uuid references public.segments(id) on delete cascade,
  embedding vector(1536) not null,
  provider text not null,              -- 'openai', ...
  created_at timestamptz not null default now()
);

create index segment_embeddings_embedding_idx
on public.segment_embeddings
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);
```

### 2.8 query_sessions（问答记录）

```sql
create table public.query_sessions (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid references public.entities(id) on delete set null,
  question text not null,
  filters jsonb not null default '{}'::jsonb,
  retrieved_segment_ids uuid[] default '{}',
  answer text,
  answer_meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
```

---

## 3. 服务 & 工具层设计（Cursor 需要实现的模块）

在 `lib/server/` 或类似路径下，创建以下模块。

### 3.1 Supabase 客户端

`lib/server/supabaseClient.ts`

* 使用 `createClient(SUPABASE_URL, SERVICE_ROLE_KEY)`
* 只在 server 环境使用，不暴露到 browser。
* 封装一个获取 typed client 的函数，供 API Route 调用。

### 3.2 EmbeddingProvider

`lib/server/embeddingProvider.ts`

职责：

* 提供一个统一入口生成 embedding：

  ```ts
  export async function embedTexts(texts: string[]): Promise<number[][]>;
  ```
* 内部根据 `AI_EMBEDDING_MODEL`、`AI_EMBEDDING_API_KEY` 调用 OpenAI/其他接口。
* 做简单重试 & 错误处理。

### 3.3 LLMProvider

`lib/server/llmProvider.ts`

职责：

* 提供一个统一入口生成回答：

  ```ts
  export async function generateAnswer(params: {
    question: string;
    contextSegments: { id: string; text: string; meta: any }[];
    maxTokens?: number;
  }): Promise<{ answer: string; raw?: any }>;
  ```
* 内部构造 prompt：

  * 搭建一个系统 Prompt：

    * 只允许基于提供的 context 回答；
    * 如果 context 不包含答案，要说“不确定/未找到明确公开表述”；
  * 把 contextSegments 以“片段编号 + 文本节选”拼成输入；
* 调用 LLM（OpenAI 等）。

---

## 4. Admin API 设计（/api/admin/**）

这些 API 将替换前端的 mock 方法，对应 v0 的 `lib/api/admin.ts`。

约定：

* 所有 Admin 路由都在 `app/api/admin/.../route.ts` 中实现。
* 统一返回 JSON `{ data, error }` 结构，或在错误时返回合适 HTTP code + message。

### 4.1 Entities

#### 4.1.1 GET /api/admin/entities

**用途：** 列出所有实体（人物/主体）

**查询参数：** 无

**响应：**

```json
{
  "data": [ { "id": "...", "name": "...", "slug": "...", ... } ]
}
```

#### 4.1.2 POST /api/admin/entities

**请求体：**

```json
{
  "name": "Elon Musk",
  "slug": "elon-musk",
  "description": "optional",
  "avatarUrl": "optional"
}
```

**行为：**

* 检查 slug 唯一性
* 插入实体
* 返回新建记录

---

### 4.2 Sources

#### 4.2.1 GET /api/admin/sources

**响应：** 返回全部 Source 列表，或支持按 entityId 过滤（可选）。

#### 4.2.2 POST /api/admin/sources

请求体示例：

```json
{
  "name": "Elon Musk YouTube Playlist",
  "entityId": "uuid or null",
  "kind": "video",
  "originType": "youtube",
  "configSummary": "Playlist ID: xxx",
  "config": {
    "playlistId": "xxx"
  },
  "enabled": true
}
```

行为：

* 插入 sources 记录
* 将 config 保存为 JSONB

#### 4.2.3 PATCH /api/admin/sources/[id]/enabled

请求体：

```json
{ "enabled": true }
```

更新 `enabled` 字段。

---

### 4.3 Corpus（统一语料项）

#### 4.3.1 GET /api/admin/corpus

**查询参数：**

* `entityId` 可选
* `contentKind` 可选
* 可分页：`page`, `pageSize`

**响应：**

```json
{
  "data": [
    {
      "id": "...",
      "title": "...",
      "entityId": "...",
      "contentKind": "document",
      "originType": "pdf_upload",
      "status": "segments_ready",
      ...
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 42
  }
}
```

#### 4.3.2 GET /api/admin/corpus/[id]

**行为：**

* 返回该 corpus_item 的详细信息 + pipeline 状态。

```json
{
  "data": {
    "corpusItem": { ... },
    "pipeline": {
      "textImported": true,
      "segmentsBuilt": true,
      "embeddingsReady": false
    }
  }
}
```

pipeline 状态可以根据：

* 是否有 transcripts 记录 → textImported
* 是否有 segments → segmentsBuilt
* 是否为该 corpus_item 的 segments 存在 embeddings → embeddingsReady

#### 4.3.3 POST /api/admin/corpus

用于手动创建 corpus_item（比如手动录入一个 PDF 文档、演讲视频入口）。

请求体示例：

```json
{
  "entityId": "uuid",
  "sourceId": "uuid or null",
  "contentKind": "document",
  "originType": "pdf_upload",
  "title": "Elon Musk Biography",
  "description": "Authorized biography",
  "primaryUrl": "https://...",
  "language": "en",
  "publishedAt": "2023-01-01T00:00:00.000Z",
  "reliabilityLevel": 5
}
```

行为：

* 插入 corpus_items，status = 'pending'

---

### 4.4 流水线操作 API（针对单个 CorpusItem）

> 这三步对应前端的 `CorpusPipelineSteps` 中的按钮。

#### 4.4.1 POST /api/admin/corpus/[id]/import-text

**用途：** 导入该语料的文本版本（V1：手动上传；将来可扩展为自动 ASR 或 PDF 解析）。

请求体（V1 简化版）：

```json
{
  "provider": "manual",
  "language": "en",
  "segments": [
    { "text": "First paragraph or sentence...", "positionIndex": 0 },
    { "text": "Second piece of text...", "positionIndex": 1 }
  ]
}
```

行为：

1. 若已有该 corpus_item 的 transcript，则可选择：

   * 删除旧的 transcript + segments（简单方案），或
   * 保留旧记录（先选简单方案：删除重建）
2. 创建 `transcripts` 记录：

   * `provider`, `language` 等
3. 为每一个 segments 元素创建 `transcript_segments`：

   * `position_index` = 提供的 positionIndex 或遍历生成
   * `text` = 提供文本
4. 更新 corpus_items.status = 'text_imported'
5. 返回 pipeline 状态。

> 将来：
>
> * 对 `contentKind = 'video' | 'audio'`，可以实现 `provider = 'asr'` 自动调用 ASR；
> * 对 `contentKind = 'document'`，可以实现 `provider = 'pdf_extract'` 自动解析 PDF。

#### 4.4.2 POST /api/admin/corpus/[id]/build-segments

**用途：** 从 transcript_segments 生成适合 embedding 的合并片段 segments。

行为：

1. 查询 corpus_item 的 transcripts & transcript_segments，按 `position_index` 排序；
2. 按规则合并：

   * 累积文本长度在 [minLen, maxLen]（可配置，例如 200~600 字符）
   * 不区分 contentKind，只按顺序合并；
     对视频/音频可以继承 `start_sec/end_sec`（最小/最大）
     对 PDF/文档，start_sec/end_sec 可为空，page 信息在 meta 里传递
3. 删除该 corpus_item 的旧 segments & 关联 embeddings（或标记软删）
4. 插入新的 segments 记录
5. 更新 corpus_items.status:

   * 当 textImported 已 true 且 segments 生成成功 → status = 'segments_ready'

参数可以无 body（完全使用已有 transcript）。

#### 4.4.3 POST /api/admin/corpus/[id]/build-embeddings

**用途：** 对该 corpus_item 所有 segments 生成 embeddings。

行为：

1. 查询该 corpus_item 的所有 segments
2. 对每 50 条文本分批调用 `EmbeddingProvider.embedTexts`：

   * 如果已有对应 segment_id 的 embeddings，则更新；
   * 否则插入新记录。
3. 更新 corpus_items.status = 'embedded'
4. 返回 pipeline 状态。

---

## 5. Agent 问答 API（/api/agent/**）

### 5.1 GET /api/agent/entities/[slug]

**用途：** Agent 前端页面初始化时获取 Entity 基本信息。

**行为：**

* 根据 slug 查 `entities`
* 找不到返回 404
* 返回：`{ data: Entity }`

### 5.2 POST /api/agent/qa

**请求体：**

```json
{
  "entitySlug": "elon-musk",
  "question": "What does Elon Musk think about AI safety?",
  "filters": {
    "timeRange": {
      "from": "2015-01-01",
      "to": "2024-12-31"
    },
    "contentKinds": ["video", "document"],      // 可选（V1 可先忽略）
    "minReliabilityLevel": 3                    // 可选（V1 可先忽略）
  },
  "options": {
    "topK": 5,
    "maxAnswerTokens": 512
  }
}
```

**响应：**

```json
{
  "data": {
    "answer": "Elon Musk has repeatedly expressed concerns about AI safety...",
    "citations": [
      {
        "segmentId": "uuid",
        "textSnippet": "I think AI is more dangerous than nukes...",
        "corpusItem": {
          "id": "uuid",
          "title": "Interview at XYZ",
          "primaryUrl": "https://...",
          "contentKind": "video",
          "publishedAt": "2016-05-01T00:00:00.000Z",
          "positionInfo": "00:12:35-00:13:10"
        }
      }
    ],
    "meta": {
      "retrievedCount": 5,
      "usedSegmentIds": ["uuid1", "uuid2"],
      "confidence": "high"
    }
  }
}
```

### 5.3 QA 内部执行流程（RAG）

Cursor 在实现 `/api/agent/qa` 时按以下步骤：

1. **解析参数 & 找到 entity**

   * 根据 entitySlug 查 `entities.id`
   * 若无 → 404

2. **构造过滤条件**

   * `segments.corpus_item_id` → `corpus_items.entity_id = entity.id`
   * `corpus_items.status = 'embedded'`
   * 如果 filters.timeRange 存在：

     * `corpus_items.published_at` between from/to
   * 如果 filters.contentKinds 存在：

     * `corpus_items.content_kind in (...)`
   * 如果 filters.minReliabilityLevel 存在：

     * `coalesce(corpus_items.reliability_level, 0) >= minReliabilityLevel`

3. **问题向量化**

   * 调用 `EmbeddingProvider.embedTexts([question])` 得到 `queryEmbedding`

4. **向量检索**

   * 在 `segment_embeddings` 中基于 pgvector 做相似度查询：

     * 通过 join：

       * `segment_embeddings` → `segments` → `corpus_items`
     * 使用上述过滤条件
     * 按相似度排序，取 `topK`（默认 5）

   * SQL 形态示例（伪代码）：

     ```sql
     select se.id as segment_embedding_id,
            s.id as segment_id,
            s.text,
            s.start_sec,
            s.end_sec,
            s.meta,
            c.id as corpus_item_id,
            c.title,
            c.primary_url,
            c.content_kind,
            c.published_at
     from segment_embeddings se
     join segments s on se.segment_id = s.id
     join corpus_items c on s.corpus_item_id = c.id
     where c.entity_id = :entity_id
       and c.status = 'embedded'
       -- 加时间 / 类型 / 可靠性过滤
     order by se.embedding <=> :queryEmbedding
     limit :topK
     ```

5. **构建 LLM Prompt & 调用 LLM**

   * 遍历检索到的 segments，构造 context 数组：

     * 只截取文本前 N 字符用于 prompt，避免过长
   * 调用 `LLMProvider.generateAnswer({ question, contextSegments })`
   * 得到 answer 文本

6. **计算置信度（简单规则即可）**

   * 例如：如果 top1 相似度（需要在 SQL 或应用层获取）低于某阈值，则 `confidence = 'low'`
   * 否则根据匹配数量等设 high/medium/low

7. **构造 citations**

   * 对每个 segment：

     * `textSnippet` = 前 200 字符
     * `positionInfo`：

       * 如果有 start_sec/end_sec → 格式化为 `mm:ss-mm:ss`
       * 否则从 segments.meta 或 transcripts.meta 中提取页码等信息（V1 可先不实现，留空或简单 "Segment"）

8. **写 query_sessions 日志**

   * 插入：

     * `entity_id`
     * `question`
     * `filters`（原始 JSON）
     * `retrieved_segment_ids`
     * `answer`
     * `answer_meta`（包含 confidence、模型名称等）

9. **返回响应**

   * 按上面定义的结构返回

---

## 6. 实施顺序（给 Cursor 的执行路线）

可以分三大阶段，让 Cursor 一步一步实现。

### 阶段 1：数据库 & 基础服务

1. **创建 migration SQL：**

   * entities, sources, corpus_items, transcripts, transcript_segments,
     segments, segment_embeddings, query_sessions
   * 打开 pgvector 扩展 + 创建向量索引

2. **实现 Supabase 客户端：**

   * `lib/server/supabaseClient.ts`
   * 支持 server-side 调用

3. **实现 EmbeddingProvider & LLMProvider：**

   * `lib/server/embeddingProvider.ts`
   * `lib/server/llmProvider.ts`
   * 先写 OpenAI 版本

> 完成后，可以先写一些简单的 seed 脚本往数据库写几条假的 corpus_items / segments / embeddings，方便 QA 测试。

---

### 阶段 2：Admin API & 前端对接

4. **实现 /api/admin/entities**：

   * GET 列表
   * POST 创建

5. **实现 /api/admin/sources**：

   * GET 列表
   * POST 创建
   * PATCH /[id]/enabled

6. **实现 /api/admin/corpus**：

   * GET 列表（支持简单过滤、分页）
   * POST 创建 corpus_item
   * GET /[id] 返回 corpusItem + pipeline 状态

7. **实现流水线操作：**

   * POST `/api/admin/corpus/[id]/import-text`
   * POST `/api/admin/corpus/[id]/build-segments`
   * POST `/api/admin/corpus/[id]/build-embeddings`

8. **在前端替换 mock：**

   * 修改 `lib/api/admin.ts`：

     * 把 fetchPersons/Entities 改为调用真实 `/api/admin/...`
     * 确保 v0 生成的 Admin UI 可以正常创建实体/语料、触发流水线步骤

---

### 阶段 3：问答 API & RAG

9. **实现 /api/agent/entities/[slug]**：

   * GET，返回 Entity

10. **实现 /api/agent/qa**：

    * 按“RAG 内部执行流程”完成
    * 并写简单单元测试/集成测试（可选）

11. **替换前端 Agent mock：**

    * 修改 `lib/api/agent.ts` 中的 `fetchEntityBySlug` 和 `askQuestion`
    * 确保前端 `/agent/[entitySlug]` 页面发请求到真实接口

12. **验证完整流程：**

    * 手动在 Admin 界面：

      * 创建 Entity / CorpusItem
      * 导入一些文本（通过 import-text）
      * 构建 segments & embeddings
    * 在 Agent 页面提问，观察回答和引用是否来自你导入的语料

---

## 7. 后续可选扩展（非必须，先留在 PRD）

* 添加 `contentKinds` 与 `minReliabilityLevel` 等过滤在 QA API 中的支持
* 添加简单 Tag：topic/company（新增 tags 表）
* 实现自动 ingestion：

  * 对 `origin_type = 'youtube'` 的 Source，写 Edge Function 定期抓取新视频，自动创建 corpus_item
  * 对 `origin_type = 'pdf_upload'`，接入 Supabase Storage + pdf 文本抽取
* 对答案增加“时间轴/观点演化”专用 API

---

你可以直接把这份 PRD 丢给 Cursor，然后按“阶段 1 → 阶段 2 → 阶段 3”的顺序，让 Cursor 逐块实现。

