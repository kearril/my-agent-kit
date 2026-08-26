# Contract: Editor API Endpoints (Local Dev Server)

**Base URL**: `http://localhost:<PORT>/__garden-editor/api`
**Access**: Restricted to loopback addresses (`127.0.0.1`, `::1`, `::ffff:127.0.0.1`). Non-loopback requests return `403 Forbidden`.

## Endpoints

### 1. List Entries
`GET /entries`

**Response (`200 OK`)**:
```json
{
  "entries": [
    {
      "slug": "agent-oh-my-pi",
      "title": "Oh My Pi：个人专属 AI 开发搭档",
      "summary": "基于多代理架构的个人数字花园开发助手实践记录与经验总结。",
      "type": "note",
      "category": "实践",
      "draft": false,
      "source": "self",
      "tags": ["AI", "开发", "自动化"],
      "links": [],
      "related": [],
      "createdAt": "2026-08-25T00:00:00.000Z",
      "publishedAt": "2026-08-25T00:00:00.000Z",
      "updatedAt": "2026-08-25T00:00:00.000Z",
      "featuredOrder": 1,
      "extension": ".md",
      "isLocal": false
    }
  ]
}
```

---

### 2. Get Entry Detail
`GET /entries/:slug`

**Response (`200 OK`)**:
```json
{
  "entry": {
    "slug": "agent-oh-my-pi",
    "title": "Oh My Pi：个人专属 AI 开发搭档",
    "summary": "基于多代理架构的个人数字花园开发助手实践记录与经验总结。",
    "type": "note",
    "category": "实践",
    "draft": false,
    "source": "self",
    "tags": ["AI", "开发", "自动化"],
    "links": [],
    "related": [],
    "createdAt": "2026-08-25T00:00:00.000Z",
    "publishedAt": "2026-08-25T00:00:00.000Z",
    "updatedAt": "2026-08-25T00:00:00.000Z",
    "featuredOrder": 1,
    "body": "# 正文内容...",
    "extension": ".md",
    "isLocal": false,
    "revision": "a1b2c3d4e5f6..."
  },
  "url": "/entries/agent-oh-my-pi/"
}
```

---

### 3. Create Entry
`POST /entries`

**Request Body**:
```json
{
  "slug": "my-new-prompt",
  "title": "我的新提示词",
  "summary": "提示词摘要说明",
  "type": "prompt",
  "draft": true,
  "source": "self",
  "tags": ["AI", "提示词"],
  "links": [],
  "related": [],
  "createdAt": "2026-08-26",
  "updatedAt": "2026-08-26",
  "body": "提示词正文..."
}
```

**Response (`201 Created`)**:
```json
{
  "entry": { "...": "..." },
  "url": null
}
```

---

### 4. Update Entry
`PUT /entries/:slug`

**Request Body**:
```json
{
  "title": "更新后的标题",
  "summary": "更新后的摘要",
  "type": "note",
  "category": "实践",
  "draft": false,
  "publishedAt": "2026-08-26",
  "updatedAt": "2026-08-26",
  "source": "self",
  "tags": ["AI"],
  "links": [],
  "related": [],
  "body": "更新后的正文...",
  "revision": "a1b2c3d4e5f6..."
}
```

**Response (`200 OK`)**:
```json
{
  "entry": { "...": "..." },
  "url": "/entries/my-note/"
}
```

**Conflict (`409 Conflict`)**:
```json
{
  "error": "Version conflict: entry was modified externally",
  "expectedRevision": "a1b2c3d4e5f6...",
  "actualRevision": "f6e5d4c3b2a1..."
}
```

---

### 5. Render Preview HTML
`POST /preview`

**Request Body**: Full or partial entry JSON with `body` and `type`.

**Response (`200 OK`)**:
```json
{
  "html": "<h1>标题</h1><p>正文解析后的 HTML...</p>"
}
```
