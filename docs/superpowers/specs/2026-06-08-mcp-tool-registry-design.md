# MCP Tool Registry + Unified Tooling Design

**Date:** 2026-06-08
**Phase:** 1 of 3 (Foundation)
**Status:** Draft — awaiting approval

---

## 1. Overview

**Problem:** The Garamatic Agentic Service exposes its domain operations through two separate tool surfaces:
- MCP Server (`server.py`) — 8 tools registered manually via `@mcp.tool()`
- LangGraph Agent (`agent_toolkit.py`) — 6 tools created manually via `StructuredTool.from_function()`

Adding a new tool requires editing two files with duplicate schemas, descriptions, and handler logic. Removing or renaming a tool risks drift between the two surfaces.

**Goal:** A single `ToolRegistry` where a tool is declared once (name, schema, handler, description) and automatically exposed as both an MCP tool and a LangGraph `StructuredTool`. One source of truth. Adding a tool = one registration call.

**Phase 1 scope:**
- `ToolRegistry` with a `ToolDefinition` dataclass
- `McpAdapter` that auto-registers all tools from the registry onto a `FastMCP` instance
- `LangGraphAdapter` that auto-creates `StructuredTool` instances from the registry
- Refactor existing 8 MCP + 6 LangGraph tools into the registry
- No new features yet — just unification and parity

**Out of scope:**
- Analytics/telemetry hooks (Phase 3)
- MCP prompts & streaming (Phase 2)
- Dynamic tool loading from config/DB (Phase 3+)

---

## 2. Architecture

```
┌─────────────────────────────────────────┐
│           Tool Registry                  │
│  ┌─────────────────────────────────┐    │
│  │  ToolDefinition (name, schema,  │    │
│  │  handler, description, group) │    │
│  └─────────────────────────────────┘    │
│           │        │        │            │
│           ▼        ▼        ▼            │
│    ┌──────────┐ ┌──────────┐ ┌────────┐ │
│    │ McpAdapter│ │LangGraph│ │Analytics│ │
│    │.register()│ │Adapter  │ │Adapter  │ │
│    │          │ │.tools()  │ │(Phase 3)│ │
│    └──────────┘ └──────────┘ └────────┘ │
└─────────────────────────────────────────┘
```

The `ToolRegistry` owns the canonical list of `ToolDefinition`s. Each adapter is thin and stateless — it only knows how to transform a `ToolDefinition` into its native framework representation.

The registry knows nothing about FastMCP or LangGraph. The adapters know nothing about each other. This keeps the registry testable without heavy framework dependencies.

---

## 3. Components

### 3.1 ToolRegistry

**File:** `src/agentic_service/tools/registry.py`

```python
class ToolRegistry:
    def register(self, tool: ToolDefinition) -> None
    def get(self, name: str) -> ToolDefinition
    def list(self, group: str | None = None) -> list[ToolDefinition]
    def names(self) -> list[str]
```

The registry is a singleton-like instance created at module level. Tool modules register their definitions at import time via `register_tools(registry)` functions.

### 3.2 ToolDefinition & ToolResult

**File:** `src/agentic_service/tools/types.py`

```python
class ToolResult(TypedDict):
    status: Literal["success", "error", "validation_error", "not_found", "approval_required"]
    error: NotRequired[str]
    # additional fields are tool-specific

@dataclass
class ToolDefinition:
    name: str
    schema: type[BaseModel]
    handler: Callable[..., Awaitable[ToolResult]]
    description: str
    group: str = "general"
    approval_threshold: float | None = None
```

- `name` — unique identifier, snake_case, matches the tool name exposed to LLMs
- `schema` — Pydantic `BaseModel` for argument validation. The adapter extracts field names, types, and descriptions from the model.
- `handler` — `async def (service: GaramaticService, **kwargs) -> dict[str, Any]`. The service is injected by the adapter at call time. For MCP, the adapter wrapper additionally accepts `ctx: Context` and extracts the service from it before calling the handler. For LangGraph, the service is bound at tool creation time and the handler receives only schema arguments.
- `description` — Markdown docstring used by both MCP and LangGraph tool descriptions
- `group` — `"ticket" | "invoice" | "email" | "customer" | "system"`. Optional. For filtering and UI organization.
- `approval_threshold` — if set, the adapter intercepts the call and checks if an approval is required before invoking the handler. Replaces scattered approval logic in `facade.py` and `agent_toolkit.py`.

### 3.3 McpAdapter

**File:** `src/agentic_service/tools/adapters.py`

```python
class McpAdapter:
    def __init__(self, registry: ToolRegistry, mcp: FastMCP):
        self._registry = registry
        self._mcp = mcp

    def register_all(self) -> None:
        for tool in self._registry.list():
            self._register_one(tool)

    def _register_one(self, tool: ToolDefinition) -> None:
        # Creates a wrapper that:
        # 1. Extracts service from MCP Context
        # 2. Validates arguments via schema
        # 3. Calls handler with service + kwargs
        # 4. Returns structured dict
        # Then calls @mcp.tool() on the wrapper
```

The adapter preserves the current MCP behavior: every tool receives `ctx: Context` and the service is extracted via `_get_service(ctx)`.

### 3.4 LangGraphAdapter

**File:** `src/agentic_service/tools/adapters.py`

```python
class LangGraphAdapter:
    def __init__(self, registry: ToolRegistry):
        self._registry = registry

    def tools(self, service: GaramaticService) -> list[StructuredTool]:
        return [self._make_tool(t, service) for t in self._registry.list()]
```

The adapter creates `StructuredTool` instances with `coroutine=` set (the handler is async). The service is bound at tool creation time, not at call time.

### 3.5 Tool Modules

Each domain group gets its own module that registers tools on import:

| Module | Tools |
|--------|-------|
| `ticket_tools.py` | `get_ticket_status`, `list_customer_tickets`, `create_ticket`, `resolve_ticket` |
| `invoice_tools.py` | `create_invoice`, `get_invoice_status` |
| `email_tools.py` | `send_email` |
| `customer_tools.py` | `get_customer_context` |
| `system_tools.py` | `request_human_approval`, `approve_request` |

Each module defines a `register_tools(registry: ToolRegistry) -> None` function. The registry is imported at module level and called immediately.

### 3.6 ApprovalInterceptor

A reusable wrapper that intercepts tool calls where `approval_threshold` is set. The logic is declarative: the tool definition declares the threshold, and the interceptor enforces it. This removes scattered approval logic from `facade.py` and `agent_toolkit.py`.

```python
def with_approval(definition: ToolDefinition):
    if definition.approval_threshold is None:
        return definition.handler

    async def wrapper(service: GaramaticService, **kwargs):
        amount = kwargs.get("billable_amount", kwargs.get("amount", 0))
        if amount > definition.approval_threshold:
            # check approval_store, raise ApprovalRequiredError if needed
            ...
        return await definition.handler(service, **kwargs)
    return wrapper
```

**Note:** The amount extraction is intentionally simple for Phase 1. In Phase 2, we may add a declarative `get_amount: Callable[[dict], float]` field to `ToolDefinition` for more flexibility.

---

## 4. Data Flow

```
User asks → Agent resolves tool name to registry entry
    │
    ▼
┌─────────────────────────────────────┐
│   Schema validates arguments        │
│   (Pydantic BaseModel)              │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│   ApprovalInterceptor checks        │
│   threshold, raises                 │
│   ApprovalRequiredError if needed   │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│   Handler calls GaramaticService    │
│   method(s)                         │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│   Structured dict with status field │
│   returned to agent                 │
└─────────────────────────────────────┘
```

Every tool handler returns a `dict[str, Any]` with at minimum a `status` field:
- `"success"` — normal completion
- `"error"` — unexpected failure
- `"validation_error"` — bad input
- `"not_found"` — resource missing
- `"approval_required"` — needs human sign-off

This is already the convention in `agent_toolkit.py`. The MCP tools in `server.py` currently return a mix of dicts and error dicts. We unify them to the same schema.

---

## 5. Error Handling

### Handler level

- `NotFoundError` → `{"status": "not_found", "error": "..."}`
- `ValidationError` → `{"status": "validation_error", "error": "..."}`
- `ApprovalRequiredError` → `{"status": "approval_required", "approval_id": "...", "error": "..."}`
- `UpstreamError` / `Exception` → `{"status": "error", "error": "..."}`

### Adapter level

- `McpAdapter` wraps the handler in a try/except that catches the same exception types and returns error dicts
- `LangGraphAdapter` lets the `StructuredTool` framework handle errors naturally — the tool returns a dict with `status: "error"` which the agent sees as a tool result

**No exceptions escape to the LLM.** The agent sees structured results and decides what to do next. This preserves the current behavior of both MCP and LangGraph surfaces.

---

## 6. File Structure

```
src/agentic_service/tools/
├── __init__.py          # exports registry, adapters, types
├── registry.py          # ToolRegistry
├── types.py             # ToolDefinition, ToolResult (TypedDict)
├── adapters.py          # McpAdapter, LangGraphAdapter
├── interceptors.py      # ApprovalInterceptor
├── ticket_tools.py      # register_tools()
├── invoice_tools.py     # register_tools()
├── email_tools.py       # register_tools()
├── customer_tools.py    # register_tools()
└── system_tools.py      # register_tools()
```

---

## 7. Migration Plan

1. **Create new modules** (`registry.py`, `types.py`, `adapters.py`, `interceptors.py`)
2. **Port one tool module** (e.g., `ticket_tools.py`) — extract the 4 ticket tools from both `server.py` and `agent_toolkit.py`, register them in the registry
3. **Verify MCP parity** — `test_mcp_tools.py` must pass with no changes
4. **Verify LangGraph parity** — `test_agent.py` must pass with no changes
5. **Port remaining tool modules** (invoice, email, customer, system)
6. **Delete old code** — remove hand-registered tools from `server.py` and `agent_toolkit.py`
7. **Run full test suite** — all 205 tests pass

---

## 8. Testing Strategy

### Unit tests
- `test_registry.py` — register, list, get, filter by group
- `test_adapters.py` — verify McpAdapter and LangGraphAdapter produce correct outputs for a fake registry
- `test_tool_definitions.py` — verify each tool module's definitions have valid schemas and handlers

### Integration tests
- `test_mcp_tools.py` — already exists; refactor to use the new registry + adapter
- `test_agent.py` — already exists; refactor to use `LangGraphAdapter` instead of `AgentToolkit`

### Validation
- `pytest` must pass all 205 tests after refactoring
- No new tests needed for the adapter layer if existing MCP + agent tests cover it
- One new test: verify that `McpAdapter.register_all()` and `LangGraphAdapter.tools()` produce the same set of tool names

---

## 9. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| MCP/LangGraph tool behavior changes | Medium | High | Keep existing tests green. Refactor is structural, not behavioral. |
| Tool description drift | Low | Medium | Single `description` field in `ToolDefinition`. Both adapters read from it. |
| Performance regression | Low | Low | Adapter overhead is one function call per tool. Negligible. |
| Approval logic breaks | Medium | High | Extract approval logic into `ApprovalInterceptor` with dedicated tests. |

---

## 10. Open Questions

1. Should the registry support **tool versioning** (e.g., `get_ticket_status_v2`)? Not needed now, but the `name` field must be unique. If we add versioning later, we could use a `version` field or namespace the name.
2. Should **tool grouping** be used for access control (e.g., some agents only see ticket tools)? Not in Phase 1, but the `group` field is reserved for it.
3. Should the registry be **immutable after startup**? Yes — tools are registered at import time. The `register()` method is module-level. No runtime mutation.

---

## 11. Next Steps After Approval

1. Invoke `writing-plans` skill to create a detailed implementation plan
2. Implement Phase 1
3. After Phase 1 ships, design Phase 2 (MCP prompts & streaming)

