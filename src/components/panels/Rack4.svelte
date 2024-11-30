<script lang="ts">
    import FmRingModulationPanel from "./modulation/FmRingModulationPanel.svelte";
</script>

<div class="main-container">
    <FmRingModulationPanel></FmRingModulationPanel>
</div>


<style>
    .main-container
    {
        box-sizing: border-box;

        /* width: min-content; */
        width: 100%;

        display: flex;
        flex-flow: row nowrap;
        /* set alignment on main axis */
        justify-content: flex-start;
        /* set alingment on cross-axis */
        align-items: center;
        /* set space between flex lines */
        align-content: flex-start;

        margin: 0px;
        padding: 0px;

        text-align: center;

        background: linear-gradient(hsla(216, 5%, 17%, 0.6) 0%, hsla(207, 5%, 5%, 0.6) 50%),
                    url("../../assets/texture/texture-large-filt-seamless-dark.png") repeat top left;
    }
</style>