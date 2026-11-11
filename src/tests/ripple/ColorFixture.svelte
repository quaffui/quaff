<script lang="ts">
  import QBtn from "#components/button/QBtn.svelte";
  import QIcon from "#components/icon/QIcon.svelte";
</script>

<QBtn id="theme" label="Theme" rippleColor="tertiary" />
<QBtn id="hex" label="Hex" rippleColor="#ff0000" />
<QBtn id="function" label="Function" rippleColor="rgb(0 128 0)" />
<QIcon id="icon" name="home" color="oklch(0.628 0.2577 29.23)" />
