<script>
	import logo from '$lib/images/logo.svg';
	import { OverlayScrollbarsComponent } from 'overlayscrollbars-svelte';
</script>

<svelte:head>
	<title>OverlayScrollbars & Svelte</title>
</svelte:head>

<OverlayScrollbarsComponent style="height: 222px; width: 222px" :options="options">
	<img src={logo} alt="Svelte Logo" width="333" height="333" />
</OverlayScrollbarsComponent>
