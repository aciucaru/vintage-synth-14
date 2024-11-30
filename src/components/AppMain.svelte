<script lang="ts">
    import Rack1 from "./panels/Rack1.svelte";
    import Rack2 from "./panels/Rack2.svelte";
    import Rack3 from "./panels/Rack3.svelte";
    import Rack4 from "./panels/Rack4.svelte";
</script>

<div class="main-container">
    <div class="column-container">
        <div class="row-container">
            <div class="column-container">
                <Rack1></Rack1>
                <Rack2></Rack2>
            </div>
            <Rack4></Rack4>
        </div>

        <Rack3></Rack3>
    </div>
</div>


<style>
    .main-container
    {
        box-sizing: border-box;

        /* width: min-content; */
        width: 100%;
        height: 100%;

        display: flex;
        flex-flow: column nowrap;
        align-items: center;
        justify-content: center;
        align-content: center;

        margin: 0px;
        padding: 0px;

        text-align: center;

        /* background: linear-gradient(hsl(216, 20%, 10%) 0%, hsl(207, 20%, 5%) 50%); */
    }

    .row-container
    {
        box-sizing: border-box;

        width: min-content;

        display: flex;
        flex-flow: row nowrap;
        align-items: stretch;
        justify-content: stretch;
        align-content: flex-start;

        margin: 0px;
        padding: 0px;

        text-align: center;
    }

    .column-container
    {
        box-sizing: border-box;

        width: min-content;

        display: flex;
        flex-flow: column nowrap;
        align-items: stretch;
        justify-content: stretch;
        align-content: flex-start;

        margin: 0px;
        padding: 0px;

        text-align: center;
    }
</style>