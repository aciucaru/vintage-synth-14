<script lang="ts">
    import { Settings } from "../../../constants/settings";
    import { monoSynth } from "../../../model/audio/synth";
    import * as lfoMatrixCallbaks from "../../../callbacks/lfo-matrix-callbacks";

    import Knob from "../../Knob.svelte";
    import ToggleButton from "../../toggle/ToggleButton.svelte";
    import WeightedMultiShapeLfoPanel from "../lfos/WeightedMultiShapeLfoPanel.svelte";
    import ToggledMultiShapeLfoPanel from "../lfos/ToggledMultiShapeLfoPanel.svelte";

    // get the LFOs from the voice
    const lfoArray = monoSynth.getVoice().getFmRingLfoArray();
</script>

<div class="main-container">
    <!-- title and border -->
    <div class="border" style="grid-column: 1 / 4; grid-row: 1 / 9;"></div>
    <div class="title stretched-item unselectable" style="grid-column: 1 / 4; grid-row: 1 / 2;">FM & Ring modulation</div>

    <div class="row-container" style="grid-column: 2 / 3; grid-row: 3 / 4;">
        <div class="column-container">
            <div>
                <Knob label={"LFO A"} minValue={Settings.minLfoManagerModulationAmount} maxValue={Settings.maxLfoManagerModulationAmount} initialValue={Settings.defaultLfoManagerModulationAmount}
                    step={0.01} decimals={0} displayFactor={100}
                    onValueChange={lfoMatrixCallbaks.onOscillator1FreqLfoModAmountChange}></Knob>
            </div>
            <div>
                <ToggleButton onToggleChange={ (isToggled) => { lfoMatrixCallbaks.onOscillator1FreqLfoToggle(0, isToggled); } }>
                    <div slot="bgOnImage" class="green-button-image background-on-image"></div>
                    <div slot="bgOffImage" class="green-button-image background-off-image"></div>
                    <div slot="fgOnImage" class="green-button-image foreground-on-green-image"></div>
                    <div slot="fgOffImage" class="green-button-image foreground-off-green-image"></div>
                </ToggleButton>
            </div>
            <ToggledMultiShapeLfoPanel unipolarLfo={lfoArray[0]} label={"LFO A"}></ToggledMultiShapeLfoPanel>
        </div>

        <div class="column-container">
            <div>
                <Knob label={"LFO B"} minValue={Settings.minLfoManagerModulationAmount} maxValue={Settings.maxLfoManagerModulationAmount} initialValue={Settings.defaultLfoManagerModulationAmount}
                    step={0.01} decimals={0} displayFactor={100}
                    onValueChange={lfoMatrixCallbaks.onOscillator2FreqLfoModAmountChange}></Knob>
            </div>
            <div>
                <ToggleButton onToggleChange={ (isToggled) => { lfoMatrixCallbaks.onOscillator2FreqLfoToggle(1, isToggled); } }>
                    <div slot="bgOnImage" class="green-button-image background-on-image"></div>
                    <div slot="bgOffImage" class="green-button-image background-off-image"></div>
                    <div slot="fgOnImage" class="green-button-image foreground-on-green-image"></div>
                    <div slot="fgOffImage" class="green-button-image foreground-off-green-image"></div>
                </ToggleButton>
            </div>
            <ToggledMultiShapeLfoPanel unipolarLfo={lfoArray[1]} label={"LFO B"}></ToggledMultiShapeLfoPanel>
        </div>

        <div class="column-container">
            <div>
                <Knob label={"LFO C"} minValue={Settings.minLfoManagerModulationAmount} maxValue={Settings.maxLfoManagerModulationAmount} initialValue={Settings.defaultLfoManagerModulationAmount}
                    step={0.01} decimals={0} displayFactor={100}
                    onValueChange={lfoMatrixCallbaks.onSubOscillatorFreqLfoModAmountChange}></Knob>
            </div>
            <div>
                <ToggleButton onToggleChange={ (isToggled) => { lfoMatrixCallbaks.onSubOscillatorFreqLfoToggle(2, isToggled); } }>
                    <div slot="bgOnImage" class="green-button-image background-on-image"></div>
                    <div slot="bgOffImage" class="green-button-image background-off-image"></div>
                    <div slot="fgOnImage" class="green-button-image foreground-on-green-image"></div>
                    <div slot="fgOffImage" class="green-button-image foreground-off-green-image"></div>
                </ToggleButton>
            </div>
            <ToggledMultiShapeLfoPanel unipolarLfo={lfoArray[2]} label={"LFO C"}></ToggledMultiShapeLfoPanel>
        </div>
    </div>
</div>

<style>
    .main-container
    {
        box-sizing: border-box;

        /* width: min-content; */
        /* height: 350px; */

        display: grid;
        grid-template-columns: 10px auto 10px;
        grid-template-rows: auto 10px /* algorithm title */
                            auto 10px /* algorithm content */
                            auto 10px /* modulators title */
                            auto 10px; /* modulators content */

        justify-items: center;
        align-items: stretch;
        justify-content: space-between;
        align-content: space-between;
        gap: 0px;

        margin: 0px;
        padding: 5px;

        border-radius: 2px;
    }

    .title
    {
        margin: 0px;
        padding: 2px;

        background: url("../../../assets/texture/title-texture-green-filt-seamless.png") repeat top left;

        color: hsl(0, 0%, 85%);
        font-family: sans-serif;
        font-size: 12px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: clip;
    }

    .border
    {
        margin: 0px;
        padding: 0px;

        justify-self: stretch;
        align-self: stretch;

        border-bottom-left-radius: 2px;
        border-bottom-right-radius: 2px;
        border: solid 1px hsl(171, 25%, 22%);
        border-top: none;
    }

    .stretched-item
    {
        justify-self: stretch;
    }

    .row-container
    {
        box-sizing: border-box;

        width: min-content;

        display: flex;
        flex-flow: row nowrap;
        align-items: stretch; /* set alingment on cross-axis */
        justify-content: stretch; /* set alignment on main axis */
        align-content: flex-start; /* set space between flex lines */

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
        align-items: center; /* set alingment on cross-axis */
        justify-content: stretch; /* set alignment on main axis */
        align-content: flex-start; /* set space between flex lines */

        margin: 0px;
        padding: 0px;

        text-align: center;
    }

    /* classes for default button images */
    .green-button-image
    {
        /* width and height are necessary in order to display the background image */
        width: 24px;
        height: 20px;
        padding: 0px;
        margin: 0px;

        border: none;

        /* necessary settings, otherwise the SVG background won't display properly: */
        background-size: 100% auto;
        background-size: contain;
        background-attachment: scroll;
        background-repeat: no-repeat;
        background-position: top left;
    }

    .background-on-image
    {
        background-image: url("../../../assets/toggle-button/toggle-button-bg-opt.svg");
    }

    .background-off-image
    {
        background-image: url("../../../assets/toggle-button/toggle-button-bg-opt.svg");
    }

    .foreground-on-green-image
    {
        background-image: url("../../../assets/toggle-button/toggle-button-fg-on-green-opt.svg");
    }

    .foreground-off-green-image
    {
        background-image: url("../../../assets/toggle-button/toggle-button-fg-off-green-opt.svg");
    }

    .unselectable
    {
        user-select: none;
        -webkit-user-select: none;
    }
</style>