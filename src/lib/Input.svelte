<script lang="ts">
  let { autofocus = false, required = false, label, name, type, value = $bindable() } = $props()
  let focused = $state(value.length > 0)
  let input: HTMLElement

  const focus = () => {
    focused = true
  }

  const blur = () => {
    if (value.length < 1) {
      focused = false
    }
  }

  const select = () => {
    focused = true
    if (input) {
      input.focus()
    }
  }

  $effect(() => {
    focused = value.length > 0
  })
</script>

<div class="root" class:focused>
  <!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
  <label
    class="label"
    for={name}
    onclick={focused ? null : select}
    onkeyup={focused ? null : select}
    onkeydown={focused ? null : select}
    role="button"
  >
    {label}
  </label>
  <!-- svelte-ignore a11y_autofocus -->
  <input
    class="input"
    {autofocus}
    {required}
    {name}
    {type}
    onfocus={focus}
    onblur={blur}
    bind:value
    bind:this={input}
  />
</div>

<style>
  .root {
    position: relative;
    margin-top: 10px;
  }

  .label {
    position: absolute;
    left: 0;
    top: 12px;
    color: #999;
    background-color: #fff0;
    z-index: 10;
    cursor: auto;
    transition:
      transform 150ms ease-out,
      font-size 150ms ease-out;
  }

  .focused .label {
    transform: translateY(-125%);
    font-size: 0.75em;
  }

  .input {
    position: relative;
    padding: 12px 0px 5px 0;
    width: 100%;
    outline: 0;
    border: 0;
    border-radius: 0px;
    box-shadow: 0 1px 0 0 #e5e5e5;
    transition: box-shadow 150ms ease-out;

    &:focus {
      box-shadow: 0 2px 0 0 var(--color-primary);
    }
  }
</style>
