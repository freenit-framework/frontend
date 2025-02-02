<script lang="ts">
  let { label, name, type, value } = $props()
  let focused = $state(value.length > 0)

  const focus = () => {
    focused = true
  }

  const blur = () => {
    if (value.length < 1) {
      focused = false
    }
  }

  $effect(() => {
    focused = value.length > 0
  })
</script>

<div class="form-group" class:focused>
  <label class="form-label" for="input">{label}</label>
  <input class="input" {name} {type} onfocus={focus} onblur={blur} bind:value />
</div>

<style>
  .form-group {
    position: relative;
  }

  .form-label {
    position: absolute;
    left: 0;
    top: 10px;
    color: #999;
    background-color: #fff0;
    z-index: 10;
    transition:
      transform 150ms ease-out,
      font-size 150ms ease-out;
  }

  .focused .form-label {
    transform: translateY(-125%);
    font-size: 0.75em;
  }

  .input {
    position: relative;
    padding: 12px 0px 5px 0;
    width: 100%;
    outline: 0;
    border: 0;
    box-shadow: 0 1px 0 0 #e5e5e5;
    transition: box-shadow 150ms ease-out;

    &:focus {
      box-shadow: 0 2px 0 0 var(--color-primary);
    }
  }
</style>
