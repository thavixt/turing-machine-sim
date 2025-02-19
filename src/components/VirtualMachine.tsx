import { StepCounter } from "./StepCounter";
import { Tape } from "./Tape";
import { VirtualAction, TurningState, useVirtualStore } from "../state";
import { sleep } from "../logic/utils";
import { ErrorMessage } from "../types";

export function VirtualMachine() {
  const calculate = useVirtualStore(state => state.calculate);
  const reset = useVirtualStore(state => state.reset);
  const running = useVirtualStore(state => state.isRunning);
  const setCurrent = useVirtualStore(state => state.setCurrentProcess);
  const setRunning = useVirtualStore(state => state.setIsRunning);
  const advance = useVirtualStore(state => state.advance);
  const stepMs = useVirtualStore(state => state.stepMs);

  const performCalculation = async () => {
    setRunning(true);

    advance();
    setCurrent('input');
    await sleep(stepMs / 2);

    setCurrent('calc');
    await sleep(stepMs / 2);
    const error = await calculate();
    if (error) {
      const errorMessage = JSON.parse(error.message) as ErrorMessage;
      console.warn(`Halted, reason: ${errorMessage.reason}`);
      return;
    }
    
    if (!TurningState.isRunning()) {
      return;
    }
    await performCalculation();
  };

  const start = () => {
    reset();
    performCalculation();
  }

  return (
    <div className="containerBox flex px-2 space-x-2 items-center">
      <button
        type="button"
        className="start"
        disabled={!!running}
        onClick={start}
      >
        Start
      </button>
      <button
        type="button"
        className="stop"
        disabled={!running}
        onClick={VirtualAction.stop}
      >
        Stop
      </button>
      <Tape />
      <Value />
      <StepCounter />
    </div>
  )
}

function Value() {
  const currentValue = useVirtualStore(state => state.currentValue);

  return (
    <div className="bg-gray-300 rounded-md px-2 text-center text-sm">
      Value: {currentValue}
    </div>
  )
}