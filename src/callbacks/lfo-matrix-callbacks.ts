import { Settings } from "../constants/settings";
import { monoSynth } from "../model/audio/synth";

import { Logger } from "tslog";
import type { ILogObj } from "tslog";

const logger: Logger<ILogObj> = new Logger({name: "LfoMatrixPanel", minLevel: Settings.minLogLevel });

// Oscillator 1 callbacks ****************************************************************************
// callbacks for Oscillator 1 amplitude **************************************************************
export function onOscillator1AmpLfoToggle(lfoIndex: number, isToggled: boolean): void
{
    if (isToggled)
        monoSynth.getVoice().getOsc1AmplitudeModulationManager().getLfoManager().enableLfo(lfoIndex);
    else
        monoSynth.getVoice().getOsc1AmplitudeModulationManager().getLfoManager().disableLfo(lfoIndex);
}

export function onOscillator1AmpLfoModAmountChange(normalizedAmount: number): void
{
    monoSynth.getVoice().getOsc1AmplitudeModulationManager().setLfosModulationAmount(normalizedAmount);
}

// callbacks for Oscillator 1 frequency **************************************************************
export function onOscillator1FreqLfoToggle(lfoIndex: number, isToggled: boolean): void
{
    if (isToggled)
        monoSynth.getVoice().getOsc1FrequencyModulationManager().getLfoManager().enableLfo(lfoIndex);
    else
        monoSynth.getVoice().getOsc1FrequencyModulationManager().getLfoManager().disableLfo(lfoIndex);
}

export function onOscillator1FreqLfoModAmountChange(normalizedAmount: number): void
{
    monoSynth.getVoice().getOsc1FrequencyModulationManager().setLfosModulationAmount(normalizedAmount);
}

// callbacks for Oscillator 1 pulse width **************************************************************
export function onOscillator1PulseWidthLfoToggle(lfoIndex: number, isToggled: boolean): void
{
    if (isToggled)
        monoSynth.getVoice().getOsc1PulseWidthModulationManager().getLfoManager().enableLfo(lfoIndex);
    else
        monoSynth.getVoice().getOsc1PulseWidthModulationManager().getLfoManager().disableLfo(lfoIndex);
}

export function onOscillator1PulseWidthLfoModAmountChange(normalizedAmount: number): void
{
    monoSynth.getVoice().getOsc1PulseWidthModulationManager().setLfosModulationAmount(normalizedAmount);
}


// callbacks for Oscillator 1 unison **************************************************************
export function onOscillator1UnisonDetuneLfoToggle(lfoIndex: number, isToggled: boolean): void
{
    if (isToggled)
        monoSynth.getVoice().getOsc1UnisonDetuneModulationManager().getLfoManager().enableLfo(lfoIndex);
    else
        monoSynth.getVoice().getOsc1UnisonDetuneModulationManager().getLfoManager().disableLfo(lfoIndex);
}

export function onOscillator1UnisonDetuneLfoModAmountChange(normalizedAmount: number): void
{
    monoSynth.getVoice().getOsc1UnisonDetuneModulationManager().setLfosModulationAmount(normalizedAmount);
}


// Oscillator 2 callbacks ****************************************************************************
// callbacks for Oscillator 2 amplitude **************************************************************
export function onOscillator2AmpLfoToggle(lfoIndex: number, isToggled: boolean): void
{
    if (isToggled)
        monoSynth.getVoice().getOsc2AmplitudeModulationManager().getLfoManager().enableLfo(lfoIndex);
    else
        monoSynth.getVoice().getOsc2AmplitudeModulationManager().getLfoManager().disableLfo(lfoIndex);
}

export function onOscillator2AmpLfoModAmountChange(normalizedAmount: number): void
{
    monoSynth.getVoice().getOsc2AmplitudeModulationManager().setLfosModulationAmount(normalizedAmount);
}

// callbacks for Oscillator 2 frequency **************************************************************
export function onOscillator2FreqLfoToggle(lfoIndex: number, isToggled: boolean): void
{
    if (isToggled)
        monoSynth.getVoice().getOsc2FrequencyModulationManager().getLfoManager().enableLfo(lfoIndex);
    else
        monoSynth.getVoice().getOsc2FrequencyModulationManager().getLfoManager().disableLfo(lfoIndex);
}

export function onOscillator2FreqLfoModAmountChange(normalizedAmount: number): void
{
    monoSynth.getVoice().getOsc2FrequencyModulationManager().setLfosModulationAmount(normalizedAmount);
}

// callbacks for Oscillator 2 pulse width **************************************************************
export function onOscillator2PulseWidthLfoToggle(lfoIndex: number, isToggled: boolean): void
{
    if (isToggled)
        monoSynth.getVoice().getOsc2PulseWidthModulationManager().getLfoManager().enableLfo(lfoIndex);
    else
        monoSynth.getVoice().getOsc2PulseWidthModulationManager().getLfoManager().disableLfo(lfoIndex);
}

export function onOscillator2PulseWidthLfoModAmountChange(normalizedAmount: number): void
{
    monoSynth.getVoice().getOsc2PulseWidthModulationManager().setLfosModulationAmount(normalizedAmount);
}

// callbacks for Oscillator 2 unison **************************************************************
export function onOscillator2UnisonDetuneLfoToggle(lfoIndex: number, isToggled: boolean): void
{
    if (isToggled)
        monoSynth.getVoice().getOsc2UnisonDetuneModulationManager().getLfoManager().enableLfo(lfoIndex);
    else
        monoSynth.getVoice().getOsc2UnisonDetuneModulationManager().getLfoManager().disableLfo(lfoIndex);
}

export function onOscillator2UnisonDetuneLfoModAmountChange(normalizedAmount: number): void
{
    monoSynth.getVoice().getOsc2UnisonDetuneModulationManager().setLfosModulationAmount(normalizedAmount);
}


// Sub Oscillator callbacks ****************************************************************************
// callbacks for Sub oscillator frequency **************************************************************
export function onSubOscillatorFreqLfoToggle(lfoIndex: number, isToggled: boolean): void
{
    if (isToggled)
        monoSynth.getVoice().getSubOscFrequencyModulationManager().getLfoManager().enableLfo(lfoIndex);
    else
        monoSynth.getVoice().getSubOscFrequencyModulationManager().getLfoManager().disableLfo(lfoIndex);
}

export function onSubOscillatorFreqLfoModAmountChange(normalizedAmount: number): void
{
    monoSynth.getVoice().getSubOscFrequencyModulationManager().setLfosModulationAmount(normalizedAmount);
}


// callbacks for Sub oscillator amplitude **************************************************************
export function onSubOscillatorAmpLfoToggle(lfoIndex: number, isToggled: boolean): void
{
    if (isToggled)
        monoSynth.getVoice().getSubOscAmplitudeModulationManager().getLfoManager().enableLfo(lfoIndex);
    else
        monoSynth.getVoice().getSubOscAmplitudeModulationManager().getLfoManager().disableLfo(lfoIndex);
}

export function onSubOscillatorAmpLfoModAmountChange(normalizedAmount: number): void
{
    monoSynth.getVoice().getSubOscAmplitudeModulationManager().setLfosModulationAmount(normalizedAmount);
}



// Filter callbacks ****************************************************************************
// *********************************************************************************************
// callbacks for Filter cutoff frequency **************************************************************
export function onLowPassFilterCutoffFreqLfo1Toggle(isToggled: boolean): void
{
    if (isToggled)
        monoSynth.getVoice().getFilter().getCutoffFreqModulationManager().getLfoManager().enableLfo(0);
    else
        monoSynth.getVoice().getFilter().getCutoffFreqModulationManager().getLfoManager().disableLfo(0);
}

export function onLowPassFilterCutoffFreqLfo2Toggle(isToggled: boolean): void
{
    if (isToggled)
        monoSynth.getVoice().getFilter().getCutoffFreqModulationManager().getLfoManager().enableLfo(1);
    else
        monoSynth.getVoice().getFilter().getCutoffFreqModulationManager().getLfoManager().disableLfo(1);
}

export function onLowPassFilterCutoffFreqLfo3Toggle(isToggled: boolean): void
{
    if (isToggled)
        monoSynth.getVoice().getFilter().getCutoffFreqModulationManager().getLfoManager().enableLfo(2);
    else
        monoSynth.getVoice().getFilter().getCutoffFreqModulationManager().getLfoManager().disableLfo(2);
}

export function onLowPassFilterCutoffFreqLfo4Toggle(isToggled: boolean): void
{
    if (isToggled)
        monoSynth.getVoice().getFilter().getCutoffFreqModulationManager().getLfoManager().enableLfo(3);
    else
        monoSynth.getVoice().getFilter().getCutoffFreqModulationManager().getLfoManager().disableLfo(3);
}

export function onLowPassFilterCutoffFreqLfo5Toggle(isToggled: boolean): void
{
    if (isToggled)
        monoSynth.getVoice().getFilter().getCutoffFreqModulationManager().getLfoManager().enableLfo(4);
    else
        monoSynth.getVoice().getFilter().getCutoffFreqModulationManager().getLfoManager().disableLfo(4);
}

export function onFilterCutoffFreqLfoModAmountChange(normalizedAmount: number): void
{
    monoSynth.getVoice().getFilter().getCutoffFreqModulationManager().setLfosModulationAmount(normalizedAmount);
}

// callbacks for Filter resonance **************************************************************
export function onLowPassFilterResonanceLfo1Toggle(isToggled: boolean): void
{
    if (isToggled)
        monoSynth.getVoice().getFilter().getResonanceModulationManager().getLfoManager().enableLfo(0);
    else
        monoSynth.getVoice().getFilter().getResonanceModulationManager().getLfoManager().disableLfo(0);
}

export function onLowPassFilterResonanceLfo2Toggle(isToggled: boolean): void
{
    if (isToggled)
        monoSynth.getVoice().getFilter().getResonanceModulationManager().getLfoManager().enableLfo(1);
    else
        monoSynth.getVoice().getFilter().getResonanceModulationManager().getLfoManager().disableLfo(1);
}

export function onLowPassFilterResonanceLfo3Toggle(isToggled: boolean): void
{
    if (isToggled)
        monoSynth.getVoice().getFilter().getResonanceModulationManager().getLfoManager().enableLfo(2);
    else
        monoSynth.getVoice().getFilter().getResonanceModulationManager().getLfoManager().disableLfo(2);
}

export function onLowPassFilterResonanceLfo4Toggle(isToggled: boolean): void
{
    if (isToggled)
        monoSynth.getVoice().getFilter().getResonanceModulationManager().getLfoManager().enableLfo(3);
    else
        monoSynth.getVoice().getFilter().getResonanceModulationManager().getLfoManager().disableLfo(3);
}

export function onLowPassFilterResonanceLfo5Toggle(isToggled: boolean): void
{
    if (isToggled)
        monoSynth.getVoice().getFilter().getResonanceModulationManager().getLfoManager().enableLfo(4);
    else
        monoSynth.getVoice().getFilter().getResonanceModulationManager().getLfoManager().disableLfo(4);
}

export function onFilterResonanceLfoModAmountChange(normalizedAmount: number): void
{
    monoSynth.getVoice().getFilter().getResonanceModulationManager().setLfosModulationAmount(normalizedAmount);
}