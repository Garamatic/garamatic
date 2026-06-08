# MCP Tool Registry — Implementation Plan

**Date:** 2026-06-08
**Phase:** 1 of 3
**Branch:** `feat/mcp-tool-registry-design`

---

## Plan

| # | Task | Files | Risk | Tests |
|---|------|-------|------|-------|
| 1 | **Create foundation** — `types.py`, `registry.py`, `interceptors.py` | 3 new | Low | Unit tests |
| 2 | **Create adapters** — `McpAdapter`, `LangGraphAdapter` | 1 new | Low | Unit tests |
| 3 | **Port ticket tools** — extract from `server.py` + `agent_toolkit.py` | `ticket_tools.py` | Medium | `test_mcp_tools.py` + `test_agent.py` |
| 4 | **Port invoice tools** | `invoice_tools.py` | Low | `test_mcp_tools.py` + `test_agent.py` |
| 5 | **Port email tools** | `email_tools.py` | Low | `test_mcp_tools.py` + `test_agent.py` |
| 6 | **Port customer tools** | `customer_tools.py` | Low | `test_mcp_tools.py` + `test_agent.py` |
| 7 | **Port system tools** | `system_tools.py` | Medium | `test_agent.py` |
| 8 | **Refactor `server.py`** — use `McpAdapter` | `server.py` | Medium | `test_mcp_tools.py` |
| 9 | **Refactor `agent_toolkit.py`** — use `LangGraphAdapter` | `agent_toolkit.py` | Medium | `test_agent.py` |
| 10 | **Refactor `agent.py`** — wire `LangGraphAdapter` | `agent.py` | Low | `test_agent.py` |
| 11 | **Add unit tests** — registry, adapters, tool definitions | `tests/` | Low | New tests |
| 12 | **Full test suite** — all 205 tests pass | All | — | `pytest` |
| 13 | **Spec self-review** — fix any drift | `docs/` | Low | — |

---

## Task Details

### Task 1: Create Foundation

Create `src/agentic_service/tools/` package:

**`types.py`:**
- `ToolResult` TypedDict with `status`, `error`, optional fields
- `ToolDefinition` dataclass with `name`, `schema`, `handler`, `description`, `group`, `approval_threshold`
- `ToolGroup` enum (optional, but useful for type safety)

**`registry.py`:**
- `ToolRegistry` class with `register()`, `get()`, `list()`, `names()`
- Module-level singleton `_REGISTRY = ToolRegistry()`
- `get_registry() -> ToolRegistry` accessor
- Immutability: raise if `register()` called after first `get()`

**`interceptors.py`:**
- `with_approval(definition: ToolDefinition) -> Callable` wrapper
- Extracts `billable_amount` or `amount` from kwargs
- Checks `approval_threshold` against `get_settings().approval_threshold`
- Uses `service.approval_store` if available
- Raises `ApprovalRequiredError` with `approval_id` if needed
- Falls through to handler if below threshold or approved

### Task 2: Create Adapters

**`adapters.py`:**
- `McpAdapter`:
  - `__init__(self, registry: ToolRegistry, mcp: FastMCP)`
  - `register_all() -> None` — calls `mcp.tool()` for each definition
  - `_register_one(tool: ToolDefinition)` — creates wrapper
  - Wrapper: extracts `service` from `ctx`, validates args via `schema(**kwargs)`, calls `with_approval(tool)(service, **validated_dict)`, returns `dict`
  - Error handling: try/except → structured error dict

- `LangGraphAdapter`:
  - `__init__(self, registry: ToolRegistry)`
  - `tools(self, service: GaramaticService) -> list[StructuredTool]`
  - `_make_tool(tool, service)` — creates `StructuredTool.from_function(coroutine=wrapper, name=tool.name, description=tool.description)`
  - Wrapper: validates args via `schema(**kwargs)`, calls `with_approval(tool)(service, **validated_dict)`, returns `dict`
  - Error handling: try/except → structured error dict

**`__init__.py`:**
- Exports: `ToolRegistry`, `ToolDefinition`, `ToolResult`, `McpAdapter`, `LangGraphAdapter`, `get_registry`

### Task 3: Port Ticket Tools

**`ticket_tools.py`:**
- `register_tools(registry: ToolRegistry) -> None`
- 4 `ToolDefinition`s:
  1. `get_ticket_status` — schema: `GetTicketStatusSchema`, handler: calls `service.get_ticket()`, returns structured dict
  2. `list_customer_tickets` — schema: `ListCustomerTicketsSchema`, handler: calls `service.list_tickets()`
  3. `create_ticket` — schema: `CreateTicketSchema`, handler: calls `service.create_ticket()`
  4. `resolve_ticket` — schema: `ResolveTicketSchema`, handler: calls `service.resolve_ticket()`, **approval_threshold = get_settings().approval_threshold**

- All handlers use existing error handling conventions
- Descriptions extracted from existing `server.py` docstrings

### Task 4–7: Port Remaining Tools

Same pattern as Task 3:
- `invoice_tools.py` — `create_invoice`, `get_invoice_status`
- `email_tools.py` — `send_email`
- `customer_tools.py` — `get_customer_context`
- `system_tools.py` — `request_human_approval`, `approve_request`

### Task 8: Refactor `server.py`

- Remove all `@mcp.tool()` decorators
- Remove all tool handler functions
- Keep `_get_service(ctx)` and `_get_resource_service()` for resources
- In `app_lifespan`, after creating `service`, instantiate `McpAdapter(registry, mcp)` and call `register_all()`
- Keep resources (`ticket://`, `customer://`, `system://health`) as-is — they are not tools
- Verify `test_mcp_tools.py` passes

### Task 9: Refactor `agent_toolkit.py`

- Replace `AgentToolkit` with a thin wrapper that uses `LangGraphAdapter`
- `AgentToolkit.__init__` stores `service` and `adapter = LangGraphAdapter(registry)`
- `get_tools()` returns `self._adapter.tools(self._service)`
- Remove all individual tool methods (`search_tickets_by_customer`, etc.)
- Remove `_ok`, `_error`, `_validation_error`, `_not_found` helpers — they move to tool handlers
- Keep `AgentToolkit` class name for backward compatibility with `agent.py`
- Verify `test_agent.py` passes

### Task 10: Refactor `agent.py`

- `create_tools()` should still use `AgentToolkit(service).get_tools()` — no change needed if `AgentToolkit` interface is preserved
- If `AgentToolkit` interface changes, update `create_tools()` accordingly

### Task 11: Add Unit Tests

**`tests/test_tool_registry.py`:**
- `test_register_tool()` — basic registration
- `test_get_tool()` — lookup by name
- `test_list_all()` — list all tools
- `test_list_by_group()` — filter by group
- `test_names()` — names list
- `test_duplicate_name_raises()` — registry rejects duplicate names
- `test_immutability_after_get()` — `register()` raises after first `get()`

**`tests/test_tool_adapters.py`:**
- `test_mcp_adapter_register_all()` — fake registry + fake mcp, verify all tools registered
- `test_langgraph_adapter_tools()` — fake registry, verify StructuredTool list created
- `test_adapters_produce_same_names()` — parity check

**`tests/test_tool_definitions.py`:**
- `test_all_tools_have_valid_schemas()` — each tool's schema is a BaseModel
- `test_all_tools_have_handlers()` — handler is callable and async
- `test_all_tools_have_descriptions()` — description is non-empty
- `test_all_tools_names_unique()` — no duplicate names across modules

### Task 12: Full Test Suite

Run `pytest` and verify all 205 tests pass.

### Task 13: Spec Self-Review

- Check for any drift between implementation and spec
- Update spec if needed
- Commit any fixes

---

## Exit Criteria

- [ ] All 205 existing tests pass
- [ ] All 8 MCP tools are registered via `McpAdapter` (not hand-written)
- [ ] All 6 LangGraph tools are created via `LangGraphAdapter` (not hand-written)
- [ ] Adding a new tool requires editing only one file (the domain tool module)
- [ ] `pytest --cov=agentic_service` coverage does not decrease
- [ ] No behavioral changes — all tool signatures, descriptions, and error responses are identical

---

## Next Steps

After implementation completes:
1. Design Phase 2 (MCP prompts & streaming)
2. Design Phase 3 (Tool analytics & telemetry)
