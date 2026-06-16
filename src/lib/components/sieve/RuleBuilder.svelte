<script lang="ts">
  import type { SieveAction, SieveCondition, SieveRule } from '$lib/sieve/rules'
  import {
    actionTypes,
    conditionFields,
    conditionOps,
    generateSieve,
    newRule,
    parseSieve,
  } from '$lib/sieve/rules'

  interface Props {
    content: string
    onChange: (content: string) => void
    folders?: { value: string; label: string }[]
  }

  let { content, onChange, folders = [] }: Props = $props()

  let rules = $state<SieveRule[]>([])
  let rawMode = $state(false)
  let parseError = $state('')

  $effect(() => {
    const { rules: parsed, partial } = parseSieve(content)
    if (partial && content.trim().length > 0) {
      rawMode = true
      parseError = 'Script contains rules that cannot be edited visually. Use raw mode.'
    } else {
      parseError = ''
      rules = parsed.length > 0 || content.trim().length === 0 ? parsed : []
    }
  })

  function emit() {
    onChange(generateSieve(rules))
  }

  function addRule() {
    rules = [...rules, newRule()]
    emit()
  }

  function removeRule(index: number) {
    rules = rules.filter((_, i) => i !== index)
    emit()
  }

  function duplicateRule(index: number) {
    const original = rules[index]
    const copy: SieveRule = {
      ...original,
      id: Math.random().toString(36).slice(2),
      name: original.name ? `${original.name} (copy)` : '',
    }
    rules = [...rules.slice(0, index + 1), copy, ...rules.slice(index + 1)]
    emit()
  }

  function moveRule(index: number, direction: number) {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= rules.length) return
    const next = [...rules]
    const [moved] = next.splice(index, 1)
    next.splice(newIndex, 0, moved)
    rules = next
    emit()
  }

  function updateRule(index: number, patch: Partial<SieveRule>) {
    rules = rules.map((r, i) => (i === index ? { ...r, ...patch } : r))
    emit()
  }

  function updateCondition(
    ruleIndex: number,
    condIndex: number,
    patch: Partial<SieveCondition>,
  ) {
    rules = rules.map((r, i) => {
      if (i !== ruleIndex) return r
      return {
        ...r,
        conditions: r.conditions.map((c, j) => (j === condIndex ? { ...c, ...patch } : c)),
      }
    })
    emit()
  }

  function addCondition(ruleIndex: number) {
    rules = rules.map((r, i) =>
      i === ruleIndex
        ? { ...r, conditions: [...r.conditions, { field: 'from', op: 'contains', value: '' }] }
        : r,
    )
    emit()
  }

  function removeCondition(ruleIndex: number, condIndex: number) {
    rules = rules.map((r, i) =>
      i === ruleIndex
        ? { ...r, conditions: r.conditions.filter((_, j) => j !== condIndex) }
        : r,
    )
    emit()
  }

  function updateAction(ruleIndex: number, action: SieveAction) {
    rules = rules.map((r, i) => (i === ruleIndex ? { ...r, action } : r))
    emit()
  }

  function actionPlaceholder(action: SieveAction): string {
    switch (action.type) {
      case 'fileinto':
        return 'Folder name'
      case 'redirect':
        return 'email@example.com'
      case 'vacation':
        return 'Out of office message'
      default:
        return ''
    }
  }

  function handleRawChange(value: string) {
    onChange(value)
  }
</script>

<div class="rule-builder">
  <div class="builder-toolbar">
    <div class="mode-toggle">
      <button class="mode-btn" class:active={!rawMode} onclick={() => (rawMode = false)}>
        Visual
      </button>
      <button class="mode-btn" class:active={rawMode} onclick={() => (rawMode = true)}>
        Raw
      </button>
    </div>
    {#if !rawMode}
      <button class="add-rule-btn" onclick={addRule}>+ Add rule</button>
    {/if}
  </div>

  {#if parseError && !rawMode}
    <div class="parse-error">{parseError}</div>
  {/if}

  {#if rawMode}
    <textarea
      class="raw-editor"
      value={content}
      oninput={(e) => handleRawChange(e.currentTarget.value)}
      placeholder="# Sieve script&#10;require [&quot;fileinto&quot;];&#10;"
      spellcheck={false}
    ></textarea>
  {:else if rules.length === 0}
    <div class="empty-state">
      <p>No rules yet.</p>
      <button class="add-rule-btn" onclick={addRule}>Create your first rule</button>
    </div>
  {:else}
    <div class="rules-list">
      {#each rules as rule, index (rule.id)}
        <div class="rule-card">
          <div class="rule-header">
            <input
              class="rule-name"
              type="text"
              placeholder="Rule name (optional)"
              value={rule.name}
              oninput={(e) => updateRule(index, { name: e.currentTarget.value })}
            />
            <div class="rule-actions">
              <button
                class="icon-btn"
                title="Move up"
                disabled={index === 0}
                onclick={() => moveRule(index, -1)}
              >
                ↑
              </button>
              <button
                class="icon-btn"
                title="Move down"
                disabled={index === rules.length - 1}
                onclick={() => moveRule(index, 1)}
              >
                ↓
              </button>
              <button class="icon-btn" title="Duplicate" onclick={() => duplicateRule(index)}>
                ⧉
              </button>
              <button class="icon-btn delete" title="Delete" onclick={() => removeRule(index)}>
                ×
              </button>
            </div>
          </div>

          <div class="rule-match">
            <span>Match</span>
            <select
              value={rule.all ? 'all' : 'any'}
              onchange={(e) => updateRule(index, { all: e.currentTarget.value === 'all' })}
            >
              <option value="any">any</option>
              <option value="all">all</option>
            </select>
            <span>of the following conditions:</span>
          </div>

          <div class="conditions">
            {#each rule.conditions as condition, condIndex (condIndex)}
              <div class="condition-row">
                <select
                  class="condition-field"
                  value={condition.field}
                  onchange={(e) =>
                    updateCondition(index, condIndex, {
                      field: e.currentTarget.value as SieveCondition['field'],
                    })}
                >
                  {#each conditionFields as field (field.value)}
                    <option value={field.value}>{field.label}</option>
                  {/each}
                </select>
                <select
                  class="condition-operator"
                  value={condition.op}
                  onchange={(e) =>
                    updateCondition(index, condIndex, {
                      op: e.currentTarget.value as SieveCondition['op'],
                    })}
                >
                  {#each conditionOps as op (op.value)}
                    <option value={op.value}>{op.label}</option>
                  {/each}
                </select>
                <input
                  class="condition-value"
                  type="text"
                  value={condition.value}
                  placeholder={condition.field === 'x-spam-flag' ? 'YES' : 'value'}
                  oninput={(e) =>
                    updateCondition(index, condIndex, { value: e.currentTarget.value })}
                />
                <button
                  class="icon-btn delete"
                  title="Remove condition"
                  disabled={rule.conditions.length === 1}
                  onclick={() => removeCondition(index, condIndex)}
                >
                  ×
                </button>
              </div>
            {/each}
            <button class="add-condition-btn" onclick={() => addCondition(index)}>
              + Add condition
            </button>
          </div>

          <div class="rule-action">
            <span>Then</span>
            <select
              value={rule.action.type}
              onchange={(e) => {
                const type = e.currentTarget.value as SieveAction['type']
                let action: SieveAction
                switch (type) {
                  case 'fileinto':
                    action = { type: 'fileinto', folder: '' }
                    break
                  case 'redirect':
                    action = { type: 'redirect', address: '' }
                    break
                  case 'vacation':
                    action = { type: 'vacation', message: '', days: 7, subject: '' }
                    break
                  case 'mark-read':
                    action = { type: 'mark-read' }
                    break
                  case 'discard':
                    action = { type: 'discard' }
                    break
                  default:
                    action = { type: 'keep' }
                }
                updateAction(index, action)
              }}
            >
              {#each actionTypes as at (at.value)}
                <option value={at.value}>{at.label}</option>
              {/each}
            </select>

            {#if rule.action.type === 'fileinto'}
              <select
                value={rule.action.folder}
                onchange={(e) =>
                  updateAction(index, { type: 'fileinto', folder: e.currentTarget.value })}
              >
                <option value="" disabled>Select folder</option>
                {#each folders as folder (folder.value)}
                  <option value={folder.value}>{folder.label}</option>
                {/each}
                {#if rule.action.folder && !folders.some((f) => f.value === rule.action.folder)}
                  <option value={rule.action.folder}>{rule.action.folder}</option>
                {/if}
              </select>
            {:else if rule.action.type === 'redirect'}
              <input
                type="email"
                value={rule.action.address}
                placeholder={actionPlaceholder(rule.action)}
                oninput={(e) =>
                  updateAction(index, { type: 'redirect', address: e.currentTarget.value })}
              />
            {:else if rule.action.type === 'vacation'}
              <div class="vacation-fields">
                <input
                  type="number"
                  min="1"
                  value={rule.action.days}
                  oninput={(e) =>
                    updateAction(index, {
                      type: 'vacation',
                      days: parseInt(e.currentTarget.value) || 1,
                      message: rule.action.message,
                      subject: rule.action.subject,
                    })}
                />
                <span>days</span>
                <input
                  type="text"
                  value={rule.action.subject}
                  placeholder="Subject (optional)"
                  oninput={(e) =>
                    updateAction(index, {
                      type: 'vacation',
                      days: rule.action.days,
                      message: rule.action.message,
                      subject: e.currentTarget.value,
                    })}
                />
                <textarea
                  value={rule.action.message}
                  placeholder={actionPlaceholder(rule.action)}
                  oninput={(e) =>
                    updateAction(index, {
                      type: 'vacation',
                      days: rule.action.days,
                      message: e.currentTarget.value,
                      subject: rule.action.subject,
                    })}
                ></textarea>
              </div>
            {/if}
          </div>

          <label class="stop-label">
            <input
              type="checkbox"
              checked={rule.stop}
              onchange={(e) => updateRule(index, { stop: e.currentTarget.checked })}
            />
            Stop processing more rules after this one matches
          </label>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .rule-builder {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .builder-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.6rem 1rem;
    border-bottom: 1px solid var(--color-lightGrey, #d9e0eb);
    background: var(--bg-secondary-color, #f5f7fb);
    flex-shrink: 0;
  }

  .mode-toggle {
    display: flex;
    gap: 0.25rem;
  }

  .mode-btn {
    padding: 0.3rem 0.7rem;
    border: 1px solid var(--color-lightGrey, #d9e0eb);
    background: var(--bg-color);
    color: var(--font-color, #333);
    font-size: 0.85rem;
    cursor: pointer;
    border-radius: 4px;
  }

  .mode-btn.active {
    background: var(--color-primary, #2f63f0);
    color: var(--color-darkGrey);
    border-color: var(--color-primary, #2f63f0);
  }

  .add-rule-btn {
    padding: 0.35rem 0.8rem;
    background: var(--color-primary, #2f63f0);
    color: var(--color-darkGrey);
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
  }

  .add-rule-btn:hover {
    filter: brightness(0.9);
  }

  .parse-error {
    padding: 0.5rem 1rem;
    background: var(--bg-error, #fef2f2);
    color: var(--color-error, #d43939);
    font-size: 0.85rem;
    flex-shrink: 0;
  }

  .raw-editor {
    flex: 1;
    padding: 1rem;
    border: none;
    resize: none;
    font-family: var(--font-family-mono, monospace);
    font-size: 0.9rem;
    line-height: 1.5;
    outline: none;
  }

  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    color: var(--color-grey, #60708a);
  }

  .rules-list {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .rule-card {
    border: 1px solid var(--color-lightGrey, #d9e0eb);
    border-radius: 8px;
    padding: 1rem;
    background: var(--bg-color);
  }

  .rule-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .rule-name {
    flex: 1;
    padding: 0.35rem 0.5rem;
    border: 1px solid var(--color-lightGrey, #d9e0eb);
    border-radius: 4px;
    font-size: 0.9rem;
    font-weight: 600;
  }

  .rule-actions {
    display: flex;
    gap: 0.25rem;
  }

  .icon-btn {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--color-lightGrey, #d9e0eb);
    background: var(--bg-color);
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
    color: var(--font-color, #333);
  }

  .icon-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .icon-btn.delete {
    color: var(--color-error, #d43939);
    border-color: var(--color-error, #d43939);
  }

  .icon-btn.delete:hover:not(:disabled) {
    background: var(--color-error, #d43939);
    color: var(--color-darkGrey);
  }

  .rule-match {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }

  .rule-match select {
    padding: 0.25rem 0.4rem;
    border: 1px solid var(--color-lightGrey, #d9e0eb);
    border-radius: 4px;
    font-size: 0.85rem;
  }

  .conditions {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    margin-bottom: 0.75rem;
  }

  .condition-row {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .condition-row select,
  .condition-row input {
    padding: 0.3rem 0.4rem;
    border: 1px solid var(--color-lightGrey, #d9e0eb);
    border-radius: 4px;
    font-size: 0.85rem;
  }

  .condition-row select {
    flex: 0 0 auto;
    width: auto;
  }

  .condition-field {
    min-width: 7rem;
  }

  .condition-operator {
    min-width: 6rem;
  }

  .condition-row .condition-value {
    flex: 1 1 auto;
    width: 100%;
    min-width: 0;
  }

  .add-condition-btn {
    align-self: flex-start;
    padding: 0.25rem 0.6rem;
    background: none;
    border: 1px dashed var(--color-lightGrey, #d9e0eb);
    border-radius: 4px;
    color: var(--color-primary, #2f63f0);
    font-size: 0.8rem;
    cursor: pointer;
  }

  .add-condition-btn:hover {
    border-color: var(--color-primary, #2f63f0);
  }

  .rule-action {
    display: flex;
    align-items: flex-start;
    gap: 0.4rem;
    font-size: 0.9rem;
    flex-wrap: wrap;
  }

  .rule-action select {
    padding: 0.3rem 0.4rem;
    border: 1px solid var(--color-lightGrey, #d9e0eb);
    border-radius: 4px;
    font-size: 0.85rem;
    min-width: 180px;
  }

  .rule-action input,
  .rule-action textarea {
    padding: 0.3rem 0.4rem;
    border: 1px solid var(--color-lightGrey, #d9e0eb);
    border-radius: 4px;
    font-size: 0.85rem;
    min-width: 180px;
  }

  .vacation-fields {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.4rem;
    flex: 1;
  }

  .vacation-fields input[type='number'] {
    width: 60px;
    min-width: 60px;
  }

  .vacation-fields textarea {
    width: 100%;
    min-height: 80px;
    resize: vertical;
  }

  .stop-label {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-top: 0.75rem;
    font-size: 0.85rem;
    color: var(--color-grey, #60708a);
    cursor: pointer;
  }

  .stop-label input {
    cursor: pointer;
  }
</style>
