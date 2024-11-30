import { Settings } from "../../../../constants/settings";

import { Logger } from "tslog";
import type { ILogObj } from "tslog";


/* General-purpose ADSR envelope; this envelope does not have a predefined min and max value,
** instead, it can vary between 0.0 and 1.0.
** It also has a sustain level, where 'sustainLevel' can be maximum 1.0 (100%);
**
** The ADSR enevelope is always between 0.0 and 1.0 and it supposed to by multiplied by the 'evelope amount',
** where the 'envelope amount' is no longer a relative value (between 0 and 1) but an absolute value,
** in the same measurement units as the parameter (destination) it's modulating. This multiplication
** is optional and is made outside this class, usually through a GainNode.
**
** Then, the ADSR envelope is added to the current value of the parameter it's modulating.
**
** The optional 'envelope amount' can be positive or negative. When it's positive, the ADSR envelope is added to
** the current value of the parameter is' modulating. When the 'envelope amount' is negative, the result of
** the ADSR envelope is subtracted from the current value of the parameter it's modulating.
** But regardless of the sign, the ADSR envelope is first multiplied with the 'envelope amount' and then
** added to the current value of the parameter it's modulating.
**
** The ADSR envelope is a modulator, thus is must emit a signal. The main functionality of the ADSR envelope comes
** from a GainNode, but the GainNode itself does not emit any signal, it is just a multiplier that multiplies a
** input signal. So the ADSR envelope will not work with just a GainNode. It also needs en emitter of signal.
** That emitter is a ConstanSourceNode, which is fed through the GainNode.
** Whithout the ConstantSourceNode, the ADSR envelope will not work, because it won't emit any signal. */

export class AdsrEnvelope
// extends BaseEmitterNode
{
    /* the audio context used to create and connect nodes; must be supplied from outside the class */
    private audioContext: AudioContext;

    // the final output of the oscillator; this is used to connect the oscillator to other nodes
    private outputGainNode: GainNode;

    // the emitter of a continous constant signal 
    private adsrConstantSource: ConstantSourceNode;

    // a multiplier to multiply the previous 'adsrConstantSource' constant signal with
    private adsrGainNode: GainNode;

    // main parameters: durations (not times/moments!) and sustain level
    private attackDuration: number = Settings.defaultAdsrAttackDuration;
    private decayDuration: number = Settings.defaultAdsrDecayDuration;
    private sustainLevel: number = Settings.defaultAdsrSustainLevel;
    private releaseDuration: number = Settings.defaultAdsrReleaseDuration;

    // time parameters:
    // private attackStartTime = this.audioContext.currentTime;
    // private attackEndTime = this.audioContext.currentTime + this.attackDuration; // the time the attack phase should end
    // private decayEndTime = this.attackEndTime + this.decayDuration; // the time the decay phase should end
    // private releaseStartTime = this.decayEndTime + Settings.adsrSafetyDuration; // the time the release should start
    // private releaseEndTime = this.releaseStartTime + this.releaseDuration; // the time the release phase should end
    private onTime = 0; // time when the ADSR is turned on
    private attackStartTime = this.onTime + Settings.adsrSafetyDuration;
    private attackEndTime = this.attackDuration; // the time the attack phase should end
    private decayEndTime = this.attackEndTime + this.decayDuration; // the time the decay phase should end
    private releaseStartTime = this.decayEndTime + Settings.adsrSafetyDuration; // the time the release should start
    private releaseEndTime = this.releaseStartTime + this.releaseDuration; // the time the release phase should end
    private offtTime = this.releaseEndTime + Settings.adsrSafetyDuration; // time when ADSR is turned off
    
    private static readonly logger: Logger<ILogObj> = new Logger({name: "AdsrEnvelope", minLevel: Settings.minLogLevel});

    constructor(audioContext: AudioContext)
    {
        // super(audioContext);

        this.audioContext = audioContext;

        this.outputGainNode = this.audioContext.createGain();
        this.outputGainNode.gain.setValueAtTime(Settings.baseSourceDefaultGain, this.audioContext.currentTime);

        this.adsrConstantSource = this.audioContext.createConstantSource();
        this.adsrConstantSource.offset.setValueAtTime(1.0, this.audioContext.currentTime);

        this.adsrGainNode = this.audioContext.createGain();
        this.adsrGainNode.gain.setValueAtTime(Settings.minAdsrSustainLevel, this.audioContext.currentTime);

        /* The on/off gain node (final node) is 'ouputGainNode', inherited from BaseSource class.
        ** This second gain node is used for completely turning off the ADSR envelope.
        ** This node is necessary because the 'adsrGainNode' cannot have a totaly zero gain, because
        ** the 'adsrGainNode' could also be used with exponential ramps, which cannot ramp to exactly zero,
        ** leaving a very small signal that might still be audible.
        ** But the 'outputGainNode' never uses an exponential ramp, so it can go completely to zero, making the
        ** ADSR truly silent when necessary (in the 'release' phase). */
        this.outputGainNode.gain.setValueAtTime(Settings.adsrOffLevel, this.audioContext.currentTime);

        // connect nodes betweem them
        this.adsrConstantSource.connect(this.adsrGainNode);
        this.adsrGainNode.connect(this.outputGainNode);

        // start the emitter
        this.adsrConstantSource.start();
    }

    // returns the main gain node
    public outputNode(): GainNode { return this.outputGainNode; }

    /* This method represents the ADS portion of the envelope, it basically coressponds to the 'noteOn' event */
    public start(): void
    {
        AdsrEnvelope.logger.debug(`start(): ADSR triggered`);

        /* It might be possible that the attack-decay-sustain phase has started before the previous ADSR event has finished.
        ** If we just add an 'attack-decay-sustain' event and not cancel all remaining events, the remaining events will trigger
        ** as well, because, chronologically, they are scheduled AFTER this event.
        ** In order to prevent this bug, we use 'cancelAndHoldAtTime()'. */

        // compute the time AFTER which all the events of the gain paramter should be canceled
        const cancelationStartTime = this.audioContext.currentTime;

        /* then we cancel all events that start AFTER the previous cancelation time but we keep the value
        ** that the parameter had when the cancelation started */ 
        this.adsrGainNode.gain.cancelAndHoldAtTime(cancelationStartTime);
        this.outputGainNode.gain.cancelAndHoldAtTime(cancelationStartTime);

        /* After we checked the current ADSR phase based on ADSR times, we can now compute and overwrite ADSR times
        ** with new values.
        ** Overwriting the ADSR times should only be done after we used them to check what phase we are in!
        ** These new ADSR times will be used in the stop() method as well. */
        this.onTime = cancelationStartTime + Settings.adsrSafetyDuration;
        this.attackStartTime = this.onTime + Settings.adsrSafetyDuration; // save the attack start time
        this.attackEndTime = this.attackStartTime + this.attackDuration; // the time the attack phase should end
        this.decayEndTime = this.attackEndTime + this.decayDuration; // the time the decay phase should end

        // First, turn on the ADSR envelope, otherwise the emitted signal will be zero
        this.outputGainNode.gain.linearRampToValueAtTime(Settings.adsrOnLevel, this.onTime);

        /* Attack and decay phases */
        this.adsrGainNode.gain.linearRampToValueAtTime(Settings.maxAdsrSustainLevel, this.attackEndTime); // attack
        this.adsrGainNode.gain.linearRampToValueAtTime(this.sustainLevel, this.decayEndTime); // decay
    }

    /* This method represents the R (release) portion of the envelope, it basically coressponds to the 'noteOff' event */
    public stop(): void
    {
        AdsrEnvelope.logger.debug(`stop(): stop triggered`);

        /* It might be possible that the release phase has started before the previous ADSR event has finished.
        ** If we just add a 'release' event and not cancel all remaining events, the remaining events will trigger
        ** as well, because, chronologically, they are scheduled AFTER this 'release' event.
        ** In order to prevent this bug, we use 'cancelAndHoldAtTime()'. */

        // now we compute the time AFTER all scheduled events should be canceled
        const cancelationStartTime = this.audioContext.currentTime;

        // cancel all remaining events
        this.adsrGainNode.gain.cancelAndHoldAtTime(cancelationStartTime);
        this.outputGainNode.gain.cancelAndHoldAtTime(cancelationStartTime);

        // compute the start and end of the 'release' phase
        this.releaseStartTime = cancelationStartTime;
        this.releaseEndTime = this.releaseStartTime + this.releaseDuration;
        this.offtTime = this.releaseEndTime + Settings.adsrSafetyDuration;

        // then start the actual 'release' phase by ramping down to the minimum possible
        // for 'release' phase we use linear ramp, not exponential, because exponential goes down to quick
        this.adsrGainNode.gain.linearRampToValueAtTime(Settings.minAdsrSustainLevel, this.releaseEndTime);
        this.outputGainNode.gain.linearRampToValueAtTime(Settings.adsrOffLevel, this.offtTime);
    }

    // this method is for sequencer beats (steps)
    public startBeat(duration: number): void
    {
        let timeDuration = 0;

        if (duration > 0)
            timeDuration = duration;
        else
            timeDuration = (60.0 / 120.0) / 4.0; // default to 120 BPM 4/4

        const startTime = this.audioContext.currentTime; // the time when note was triggered
        const stopTime = startTime + timeDuration;

        /* It might be possible that the attack-decay-sustain phase has started before the previous ADSR event has finished.
        ** If we just add an 'attack-decay-sustain' event and not cancel all remaining events, the remaining events will trigger
        ** as well, because, chronologically, they are scheduled AFTER this event.
        ** In order to prevent this bug, we use 'cancelAndHoldAtTime()'. */

        // compute the time AFTER which all the events of the gain paramter should be canceled
        const cancelationStartTime = startTime;

        /* then we cancel all events that start AFTER the previous cancelation time but we keep the value
        ** that the parameter had when the cancelation started */ 
        this.adsrGainNode.gain.cancelAndHoldAtTime(cancelationStartTime);

        /* Attack-decay-sustain phase */
        this.attackStartTime = cancelationStartTime; // save the attack start time
        this.attackEndTime = this.attackStartTime + this.attackDuration; // the time the attack phase should end
        this.decayEndTime = this.attackEndTime + this.decayDuration; // the time the decay phase should end
        this.adsrGainNode.gain.linearRampToValueAtTime(Settings.maxAdsrSustainLevel, this.attackEndTime); // attack
        this.adsrGainNode.gain.linearRampToValueAtTime(this.sustainLevel, this.decayEndTime); // decay

        /* Release phase */
        this.releaseStartTime = stopTime;
        this.releaseEndTime = this.releaseStartTime + this.releaseDuration;
        // for 'release' phase we use linear ramp, not exponential, because exponential goes down to quick
        this.adsrGainNode.gain.linearRampToValueAtTime(Settings.minAdsrSustainLevel, this.releaseEndTime);
    }

    public getAttackTime(): number { return this.attackDuration; }

    public setAttackTime(attackTime: number): boolean
    {
        if (Settings.minAdsrAttackDuration <= attackTime && attackTime <= Settings.maxAdsrAttackDuration)
        {
            AdsrEnvelope.logger.debug(`setAttackTime(${attackTime})`);

            this.attackDuration = attackTime;
            return true; // value change was succesfull
        }
        else
        {
            AdsrEnvelope.logger.warn(`setAttackTime(${attackTime}): argument is outside bounds`);
            return false; // value change was not succesfull
        }
    }

    public getDecayTime(): number { return this.decayDuration; }

    public setDecayTime(decayTime: number): boolean
    {
        if (Settings.minAdsrDecayDuration <= decayTime && decayTime <= Settings.maxAdsrDecayDuration)
        {
            AdsrEnvelope.logger.debug(`setDecayTime(${decayTime})`);

            this.decayDuration = decayTime;
            return true; // value change was succesfull
        }
        else
        {
            AdsrEnvelope.logger.warn(`setDecayTime(${decayTime}): argument is outside bounds`);
            return false; // value change was not succesfull
        }
    }

    public getSustainLevel(): number { return this.sustainLevel; }

    public setSustainLevel(sustainLevel: number): boolean
    {
        if (Settings.minAdsrSustainLevel <= sustainLevel && sustainLevel <= Settings.maxAdsrSustainLevel)
        {
            AdsrEnvelope.logger.debug(`setSustainLevel(${sustainLevel})`);

            this.sustainLevel = sustainLevel;
            return true; // value change was succesfull
        }
        else
        {
            AdsrEnvelope.logger.warn(`setSustainLevel(${sustainLevel}): argument is outside bounds`);
            return false; // value change was not succesfull
        }
    }

    public getReleaseTime(): number { return this.releaseDuration; }

    public setReleaseTime(releaseTime: number): boolean
    {
        if (Settings.minAdsrReleaseDuration <= releaseTime && releaseTime <= Settings.maxAdsrReleaseDuration)
        {
            AdsrEnvelope.logger.debug(`setReleaseTime(${releaseTime})`);

            this.releaseDuration = releaseTime;
            return true; // value change was succesfull
        }
        else
        {
            AdsrEnvelope.logger.warn(`setReleaseTime(${releaseTime}): argument is outside bounds`);
            return false; // value change was not succesfull
        }
    }
}