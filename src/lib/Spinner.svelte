<script lang="ts">
  export let size = 50
</script>

<div class="root">
  <div class="spin" style={`height: ${size}px; width: ${size}px`}></div>
</div>

<style>
  .root {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  .spin {
    border: 16px solid #eef;
    border-radius: 50%;
    border-left: 16px solid #0aa;
    -webkit-animation: spin 1.5s linear infinite;
    animation: spin 1.5s linear infinite;
  }
  @-webkit-keyframes spin {
    0% {
      -webkit-transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
    }
  }
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
