<!-- Just for testing -->
<script lang="ts" generics="T extends string">
  type Base = { value: string };

  type Test = Base & Record<T, number>;

  const { value, ...props }: Test = $props();

  for (let prop in props) {
    console.log({ prop, val: props[prop as keyof typeof props] });
  }
</script>
