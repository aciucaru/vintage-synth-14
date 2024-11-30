<script lang="ts">
    import { Settings } from "../../../constants/settings";
    import { LfoFreqRange } from "../../../model/audio/modulators/lfo/base-unipolar-lfo";
    import { UnipolarToggledMultiShapeLfo } from "../../../model/audio/modulators/lfo/unipolar-toggled-multi-shape-lfo";

    import Knob from "../../Knob.svelte";
    import SlideSwitch from "../../SlideSwitch.svelte";
    import ToggleButton from "../../toggle/ToggleButton.svelte";

    import { Logger } from "tslog";
    import type { ILogObj } from "tslog";


    // the LFO that this component is supposed to control
    export let unipolarLfo: UnipolarToggledMultiShapeLfo;

    // the label of this component, also a Svelte prop
    export let label = "";

    const logger: Logger<ILogObj> = new Logger({name: "ToggledMultiShapeLfoPanel", minLevel: Settings.minLogLevel });

    /* Variable that stores the frequency range of the singel LFO.
    ** This variable is used bothe be the callback and Svelte UI, so it must have this high scope */
    let frequencyRange: LfoFreqRange = LfoFreqRange.Low;

    // LFO callbacks ****************************************************************************************
    function onTriangleWaveToggle(isToggled: boolean)
    {
        logger.debug(`onTriangleWaveToggle(${isToggled})`);

        unipolarLfo.toggleTriangleWave(isToggled);
    }

    function onSawWaveToggle(isToggled: boolean)
    {
        logger.debug(`onSawWaveToggle((${isToggled})`);

        unipolarLfo.toggleSawWave(isToggled);
    }

    function onSquareWaveToggle(isToggled: boolean)
    {
        logger.debug(`onSquareWaveToggle((${isToggled})`);

        unipolarLfo.toggleSquareWave(isToggled);
    }

    function onSineWaveToggle(isToggled: boolean)
    {
        logger.debug(`onSineWaveToggle((${isToggled})`);

        unipolarLfo.toggleSineWave(isToggled);
    }

    function onLfoFreqChange(lfoFreq: number): void
    {
        logger.debug(`onLfoFreqChange(${lfoFreq})`);

        unipolarLfo.setFrequency(lfoFreq);
    }

    function onFrequencyRangeChange(selectedOptionIndex: number)
    {
        switch (selectedOptionIndex)
        {
            case 0: frequencyRange = LfoFreqRange.Low; break;

            case 1: frequencyRange = LfoFreqRange.Mid; break;

            case 2: frequencyRange = LfoFreqRange.High; break;
        }

        unipolarLfo.setFrequencyRange(frequencyRange);
    }
</script>

<div class="main-container">
        <!-- title -->
        {#if label.length > 0}
            <div class="title unselectable" style="grid-column: 1 / 8; grid-row: 1 / 2;">{label}</div>
        {/if}

        <div style="grid-column: 1 / 2; grid-row: 3 / 4;">
            <ToggleButton onToggleChange={onTriangleWaveToggle}>
                <div slot="bgOnImage" class="green-button-image background-on-image"></div>
                <div slot="bgOffImage" class="green-button-image background-off-image"></div>
                <div slot="fgOnImage" class="green-button-image foreground-on-green-image foreground-on-filter"></div>
                <div slot="fgOffImage" class="green-button-image foreground-off-green-image foreground-off-filter"></div>
            </ToggleButton>
        </div>
        <div class="waveform-icon triangle-icon" style="grid-column: 1 / 2; grid-row: 5 / 6;"></div>

        <div style="grid-column: 3 / 4; grid-row: 3 / 4;">
            <ToggleButton onToggleChange={onSawWaveToggle}>
                <div slot="bgOnImage" class="green-button-image background-on-image"></div>
                <div slot="bgOffImage" class="green-button-image background-off-image"></div>
                <div slot="fgOnImage" class="green-button-image foreground-on-green-image foreground-on-filter"></div>
                <div slot="fgOffImage" class="green-button-image foreground-off-green-image foreground-off-filter"></div>
            </ToggleButton>
        </div>
        <div class="waveform-icon saw-icon" style="grid-column: 3 / 4; grid-row: 5 / 6;"></div>

        <div style="grid-column: 5 / 6; grid-row: 3 / 4;">
            <ToggleButton onToggleChange={onSquareWaveToggle}>
                <div slot="bgOnImage" class="green-button-image background-on-image"></div>
                <div slot="bgOffImage" class="green-button-image background-off-image"></div>
                <div slot="fgOnImage" class="green-button-image foreground-on-green-image foreground-on-filter"></div>
                <div slot="fgOffImage" class="green-button-image foreground-off-green-image foreground-off-filter"></div>
            </ToggleButton>
        </div>
        <div class="waveform-icon square-icon" style="grid-column: 5 / 6; grid-row: 5 / 6;"></div>

        <div style="grid-column: 7 / 8; grid-row: 3 / 4;">
            <ToggleButton onToggleChange={onSineWaveToggle} isToggled={true}>
                <div slot="bgOnImage" class="green-button-image background-on-image"></div>
                <div slot="bgOffImage" class="green-button-image background-off-image"></div>
                <div slot="fgOnImage" class="green-button-image foreground-on-green-image foreground-on-filter"></div>
                <div slot="fgOffImage" class="green-button-image foreground-off-green-image foreground-off-filter"></div>
            </ToggleButton>
        </div>
        <div class="waveform-icon sine-icon" style="grid-column: 7 / 8; grid-row: 5 / 6;"></div>

        <div style="grid-column: 1 / 4; grid-row: 7 / 8;">
            <SlideSwitch optionsArray={["0 - 5 Hz", "5 - 50 Hz", "50 - 2k Hz"]} onToggleChange={onFrequencyRangeChange}></SlideSwitch>
        </div>
    
        <!-- the knob for frequency change is different depending on the frequency range of the LFO (the min. and max. limits vary)-->
        {#if frequencyRange === LfoFreqRange.Low}
            <div style="grid-column: 5 / 8; grid-row: 7 / 8;">
                <Knob label={"Rate"} minValue={Settings.minLfoLowAbsoluteFrequency} maxValue={Settings.maxLfoLowAbsoluteFrequency} initialValue={Settings.defaultLfoLowAbsoluteFrequency}
                    step={0.01} decimals={2} onValueChange={onLfoFreqChange}></Knob>
            </div>
        {:else if frequencyRange === LfoFreqRange.Mid}
            <div style="grid-column: 5 / 8; grid-row: 7 / 8;">
                <Knob label={"Rate"} minValue={Settings.minLfoMidAbsoluteFrequency} maxValue={Settings.maxLfoMidAbsoluteFrequency} initialValue={Settings.defaultLfoMidAbsoluteFrequency}
                    step={1} decimals={1} onValueChange={onLfoFreqChange}></Knob>
            </div>
        {:else if frequencyRange === LfoFreqRange.High}
            <div style="grid-column: 5 / 8; grid-row: 7 / 8;">
                <Knob label={"Rate"} minValue={Settings.minLfoHighAbsoluteFrequency} maxValue={Settings.maxLfoHighAbsoluteFrequency} initialValue={Settings.defaultLfoHighAbsoluteFrequency}
                    step={1} decimals={0} onValueChange={onLfoFreqChange}></Knob>
            </div>
        {/if}
</div>

<style>
    .main-container
    {
        box-sizing: border-box;

        /* height: 250px; */
        width: min-content;

        display: grid;
        grid-template-columns: auto 5px
                                auto 5px
                                auto 5px
                                auto; 
        grid-template-rows: auto 5px /* label */
                            auto 5px /* toggle buttons */
                            auto 5px /* toggle buttons icons */
                            auto; /* frequency range selector & frequency knob */

        justify-items: stretch; /* aligns grid items along the inline (row) axis */
        align-items: center; /* aligns grid items along the block (column) axis */
        /* justify-content: space-between;
        align-content: space-between; */
        /* justify-content: space-between; */
        justify-content: center;
        align-content: space-between;
        gap: 0px;

        margin: 0px;
        padding: 0px;
        padding-left: 10px;
        padding-right: 10px;

        border-radius: 0px;
    }

    .row-container
    {
        box-sizing: border-box;

        width: min-content;

        display: flex;
        flex-flow: row nowrap;
        align-items: stretch;
        /* align-items: center; */
        /* justify-content: stretch; */
        justify-content: center;
        /* align-content: flex-start; */
        align-content: center;
        gap: 0px;

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
        align-items: center;
        justify-content: stretch;
        align-content: flex-start;

        margin: 0px;
        padding: 0px;

        text-align: center;
    }

    .title
    {
        margin: 0px;
        padding: 5px;

        /* background: url("../../../assets/texture/pad-texture-small-light-blue-filt-seamless.jpg") repeat top left; */
        background: url("../../../assets/texture/title-texture-green-filt-seamless.png") repeat top left;

        color: hsl(0, 0%, 85%);
        font-family: sans-serif;
        font-size: 12px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: clip;
    }

    .waveform-icon
    {
        width: 12px;
        height: 12px;

        padding: 0px;
        margin: 0px;
        margin-left: 2px;

        border: none;

        /* necessary settings, otherwise the SVG background won't display properly: */
        background-size: 100% auto;
        background-size: contain;
        background-attachment: scroll;
        background-repeat: no-repeat;
        background-position: top left;
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

    /* classes for filters */
    .foreground-on-filter
    {
        filter: brightness(100%);
    }

    .foreground-on-filter:hover
    {
        filter: brightness(80%);
    }

    .foreground-off-filter
    {
        filter: brightness(100%);
    }

    .foreground-off-filter:hover
    {
        filter: brightness(120%);
    }

    .triangle-icon
    {
        background-image: url("../../../assets/icons/wave-triangle-single-opt.svg");
    }

    .saw-icon
    {
        background-image: url("../../../assets/icons/wave-saw-single-opt.svg");
    }

    .square-icon
    {
        background-image: url("../../../assets/icons/wave-pulse-single-opt.svg");
    }

    .sine-icon
    {
        background-image: url("../../../assets/icons/wave-sine-single-opt.svg");
    }

    .unselectable
    {
        user-select: none;
        -webkit-user-select: none;
    }
</style>