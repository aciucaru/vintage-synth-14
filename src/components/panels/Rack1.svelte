<script lang="ts">
    import Oscillator1Panel from "./oscillators/Oscillator1Panel.svelte";
    import Oscillator2Panel from "./oscillators/Oscillator2Panel.svelte";
    import SubOscillatorPanel from "./oscillators/SubOscillatorPanel.svelte";
    import NoiseOscillatorPanel from "./oscillators/NoiseOscillatorPanel.svelte";

    import FilterSettingsPanel from "./filter/FilterSettingsPanel.svelte";
    import VoiceSettingsPanel from "./sub-panels/VoiceSettingsPanel.svelte";
    import InvisibleKeyboard from "../InvisibleKeyboard.svelte";

    import FmRingModulationPanel from "./modulation/FmRingModulationPanel.svelte";
</script>

<div class="main-container">
    <Oscillator1Panel></Oscillator1Panel>
    <Oscillator2Panel></Oscillator2Panel>
    <SubOscillatorPanel></SubOscillatorPanel>
    <NoiseOscillatorPanel></NoiseOscillatorPanel>

    <FilterSettingsPanel></FilterSettingsPanel>
    <VoiceSettingsPanel></VoiceSettingsPanel>

    <!-- <FmRingModulationPanel></FmRingModulationPanel> -->

    <InvisibleKeyboard></InvisibleKeyboard>

    <!-- <TestOscillatorPanel></TestOscillatorPanel> -->
    <!-- <TestFilterSettingsPanel></TestFilterSettingsPanel> -->
    <!-- <TestInvisibleKeyboard></TestInvisibleKeyboard> -->
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
        align-items: stretch;
        /* set space between flex lines */
        align-content: flex-start;

        margin: 0px;
        padding: 10px;
        padding-left: 15px;
        padding-right: 15px;

        text-align: center;

        background: linear-gradient(hsla(216, 20%, 20%, 0.3) 0%, hsla(207, 20%, 5%, 0.3) 50%),
                    url("../../assets/texture/pad-texture-small-dark-blue-filt-seamless.jpg") repeat top left;
    }
</style>