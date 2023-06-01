<script>
  import "../lib/css/index.sass";
  import "beercss/dist/cdn/beer.min.css";
  import "beercss/dist/cdn/material-symbols-outlined.woff2";
  import "beercss/dist/cdn/material-symbols-rounded.woff2";
  import "beercss/dist/cdn/material-symbols-sharp.woff2";
  import { Quaff } from "$stores/Quaff";

  $: console.log($Quaff);
</script>

<slot />
