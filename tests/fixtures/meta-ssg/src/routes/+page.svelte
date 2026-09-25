<script>
  import { useMeta } from "$lib/meta";

  let { data } = $props();

  useMeta(() => ({
    title: data.title,
    meta: { description: { name: "description", content: data.description } },
  }));
</script>

<h1>{data.title}</h1>
