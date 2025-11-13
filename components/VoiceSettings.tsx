import React from 'react';

interface VoiceSettingsProps {
  pitch: number;
  onPitchChange: (pitch: number) => void;
  speakingRate: number;
  onSpeakingRateChange: (rate: number) => void;
  onReset: () => void;
  isRecording: boolean;
}

const VoiceSettings: React.FC<VoiceSettingsProps> = ({
  pitch,
  onPitchChange,
  speakingRate,
  onSpeakingRateChange,
  onReset,
  isRecording,
}) => {
  return (
    <div className="my-4 p-4 border border-slate-200 rounded-lg bg-slate-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-md font-semibold text-slate-700">Voice Settings</h3>
        <button
          onClick={onReset}
          disabled={isRecording}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
        >
          Reset
        </button>
      </div>
      <div className="space-y-3">
        {/* Pitch Slider */}
        <div>
          <label htmlFor="pitch" className="block text-sm font-medium text-slate-600 mb-1">
            Pitch ({pitch.toFixed(1)})
          </label>
          <input
            id="pitch"
            type="range"
            min="-20"
            max="20"
            step="0.5"
            value={pitch}
            onChange={(e) => onPitchChange(parseFloat(e.target.value))}
            disabled={isRecording}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:accent-slate-400 disabled:cursor-not-allowed"
            aria-label="Adjust voice pitch"
          />
        </div>
        {/* Speaking Rate Slider */}
        <div>
          <label htmlFor="speaking-rate" className="block text-sm font-medium text-slate-600 mb-1">
            Speaking Rate ({speakingRate.toFixed(2)}x)
          </label>
          <input
            id="speaking-rate"
            type="range"
            min="0.25"
            max="4.0"
            step="0.05"
            value={speakingRate}
            onChange={(e) => onSpeakingRateChange(parseFloat(e.target.value))}
            disabled={isRecording}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:accent-slate-400 disabled:cursor-not-allowed"
            aria-label="Adjust voice speaking rate"
          />
        </div>
      </div>
    </div>
  );
};

export default VoiceSettings;
