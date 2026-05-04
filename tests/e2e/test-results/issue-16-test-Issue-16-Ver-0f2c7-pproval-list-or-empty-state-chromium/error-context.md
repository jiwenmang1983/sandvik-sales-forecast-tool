# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: issue-16-test.spec.ts >> Issue #16 Verification: Approval Page + Login >> ✅ Approval Page - Issue #16 Verification >> TC-04-02: Approval page shows approval list or empty state
- Location: issue-16-test.spec.ts:138:5

# Error details

```
Error: Channel closed
```

```
Error: locator.click: Target page, context or browser has been closed
Call log:
  - waiting for locator('.dev-form .ant-select').first()
    - locator resolved to <div data-v-08aaad4e="" class="ant-select ant-select-in-form-item css-dev-only-do-not-override-1p3hq3p ant-select-single ant-select-show-arrow ant-select-show-search">…</div>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is not visible
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is not visible
    - retrying click action
      - waiting 100ms
    15 × waiting for element to be visible, enabled and stable
       - element is not visible
     - retrying click action
       - waiting 500ms

```

```
Error: browserContext.close: Target page, context or browser has been closed
```