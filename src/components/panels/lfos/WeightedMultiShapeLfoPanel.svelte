<script lang="ts">
    import { Settings } from "../../../constants/settings";
    import { LfoFreqRange } from "../../../model/audio/modulators/lfo/base-unipolar-lfo";
    import { UnipolarWeightedMultiShapeLfo } from "../../../model/audio/modulators/lfo/unipolar-weighted-multi-shape-lfo";

    import Knob from "../../Knob.svelte";
    import SlideSwitch from "../../SlideSwitch.svelte";
    import VerticalFader from "../../VerticalFader.svelte";

    import { Logger } from "tslog";
    import type { ILogObj } from "tslog";


    // the LFO that this component is supposed to control
    export let unipolarLfo: UnipolarWeightedMultiShapeLfo;

    // the label of this component, also a Svelte prop
    export let label = "";

    const logger: Logger<ILogObj> = new Logger({name: "WeightedMultiShapeLfoPanel", minLevel: Settings.minLogLevel });

    /* Variable that stores the frequency range of the singel LFO.
    ** This variable is used bothe be the callback and Svelte UI, so it must have this high scope */
    let frequencyRange: LfoFreqRange = LfoFreqRange.Low;

    // LFO callbacks ****************************************************************************************
    function onTriangleGainChange(gain: number)
    {
        logger.debug(`onTriangleGainChange(${gain})`);

        unipolarLfo.setTriangleGain(gain);
    }

    function onSawGainChange(gain: number)
    {
        logger.debug(`onSawGainChange(${gain})`);

        unipolarLfo.setSawGain(gain);
    }

    function onSquareGainChange(gain: number)
    {
        logger.debug(`onSquareGainChange(${gain})`);

        unipolarLfo.setSquareGain(gain);
    }

    function onSineGainChange(gain: number)
    {
        logger.debug(`onSineGainChange(${gain})`);

        unipolarLfo.setSineGain(gain);
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
            <div class="title unselectable" style="grid-column: 1 / 4; grid-row: 1 / 2;">{label}</div>
        {/if}

        <div class="row-container" style="grid-column: 1 / 4; grid-row: 3 / 4;">
            <div class="column-container">
                <VerticalFader minValue={Settings.minAdsrAttackDuration} maxValue={Settings.maxAdsrAttackDuration}
                    initialValue={Settings.defaultAdsrFilterAttackDuration} decimals={1}
                    onValueChange={onTriangleGainChange}
                    width={25} height={150} thumbHeight={40}>
                    <div slot="track" class="track-image unselectable"></div>
                    <div slot="thumb" class="thumb-image unselectable"></div>
                </VerticalFader>
                <div class="waveform-icon triangle-icon"></div>
            </div>

            <div class="column-container">
                <VerticalFader minValue={Settings.minAdsrAttackDuration} maxValue={Settings.maxAdsrAttackDuration}
                    initialValue={Settings.defaultAdsrFilterAttackDuration} decimals={1}
                    onValueChange={onSawGainChange}
                    width={25} height={150} thumbHeight={40}>
                    <div slot="track" class="track-image unselectable"></div>
                    <div slot="thumb" class="thumb-image unselectable"></div>
                </VerticalFader>
                <div class="waveform-icon saw-icon"></div>
            </div>

            <div class="column-container">
                <VerticalFader minValue={Settings.minAdsrAttackDuration} maxValue={Settings.maxAdsrAttackDuration}
                    initialValue={Settings.defaultAdsrFilterAttackDuration} decimals={1}
                    onValueChange={onSquareGainChange}
                    width={25} height={150} thumbHeight={40}>
                    <div slot="track" class="track-image unselectable"></div>
                    <div slot="thumb" class="thumb-image unselectable"></div>
                </VerticalFader>
                <div class="waveform-icon square-icon"></div>
            </div>

            <div class="column-container">
                <VerticalFader minValue={Settings.minAdsrAttackDuration} maxValue={Settings.maxAdsrAttackDuration}
                    initialValue={Settings.defaultAdsrFilterAttackDuration} decimals={1}
                    onValueChange={onSineGainChange}
                    width={25} height={150} thumbHeight={40}>
                    <div slot="track" class="track-image unselectable"></div>
                    <div slot="thumb" class="thumb-image unselectable"></div>
                </VerticalFader>
                <div class="waveform-icon sine-icon"></div>
            </div>
        </div>

        <div style="grid-column: 1 / 2; grid-row: 5 / 6;">
            <SlideSwitch optionsArray={["0 - 5 Hz", "5 - 50 Hz", "50 - 2k Hz"]} onToggleChange={onFrequencyRangeChange}></SlideSwitch>
        </div>
    
        <!-- the knob for frequency change is different depending on the frequency range of the LFO (the min. and max. limits vary)-->
        {#if frequencyRange === LfoFreqRange.Low}
            <div style="grid-column: 3 / 4; grid-row: 5 / 6;">
                <Knob label={"Rate"} minValue={Settings.minLfoLowAbsoluteFrequency} maxValue={Settings.maxLfoLowAbsoluteFrequency} initialValue={Settings.defaultLfoLowAbsoluteFrequency}
                    step={0.01} decimals={2} onValueChange={onLfoFreqChange}></Knob>
            </div>
        {:else if frequencyRange === LfoFreqRange.Mid}
            <div style="grid-column: 3 / 4; grid-row: 5 / 6;">
                <Knob label={"Rate"} minValue={Settings.minLfoMidAbsoluteFrequency} maxValue={Settings.maxLfoMidAbsoluteFrequency} initialValue={Settings.defaultLfoMidAbsoluteFrequency}
                    step={1} decimals={1} onValueChange={onLfoFreqChange}></Knob>
            </div>
        {:else if frequencyRange === LfoFreqRange.High}
            <div style="grid-column: 3 / 4; grid-row: 5 / 6;">
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
        grid-template-columns: auto 5px /* freq. range selector */
                                auto; /* frequency rate */
        grid-template-rows: auto 5px /* label */
                            auto 5px /* shape gain faders & icons */
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

    /* classes for default button images */
    .track-image
    {
        /* width and height are necessary in order to display the background image */
        width: 25px;
        height: 150px;

        padding: 0px;
        margin: 0px;

        border: none;

        /* necessary settings, otherwise the SVG background won't display properly: */
        background-size: 100% auto;
        background-size: contain;
        background-attachment: scroll;
        background-repeat: no-repeat;
        background-position: top left;
        background-image: url("../../../assets/fader/fader-vertical-track-green-opt.svg");
        /* background-image: url("../../../assets/toggle-button/toggle-button-bg-opt.svg"); */
    }

    .thumb-image
    {
        /* width and height are necessary in order to display the background image */
        width: 25px;
        height: 40px;

        padding: 0px;
        margin: 0px;

        border: none;

        /* necessary settings, otherwise the SVG background won't display properly (the 'content' property is especially important) */
        background-size: 100% auto;
        background-size: contain; /* scales the image as large as possible within its container without cropping or stretching the image */
        background-repeat: no-repeat;
        background-position: top left;
        background-attachment: scroll;
        content: url("../../../assets/fader/fader-vertical-thumb-green-opt.svg");
        /* content: url("../assets/fader/fader-vertical-thumb-grey.svg"); */
    }

    .unselectable
    {
        user-select: none;
        -webkit-user-select: none;
    }
</style>