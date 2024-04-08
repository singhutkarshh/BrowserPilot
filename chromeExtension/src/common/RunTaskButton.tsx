import { Button, HStack, Icon } from '@chakra-ui/react';
import React from 'react';
import { useAppState } from '../state/store';
import { BsPlayFill, BsStopFill } from 'react-icons/bs';

export default function RunTaskButton(props: { runTask: () => void }) {
  const state = useAppState((state) => ({
    taskState: state.currentTask.status,
    instructions: state.ui.instructions,
    interruptTask: state.currentTask.actions.interrupt,
  }));

  let button = (
    <Button
      onClick={props.runTask}
      colorScheme="green"
      disabled={state.taskState === 'running' || !state.instructions}
    >
      Lets Go
    </Button>
  );

  if (state.taskState === 'running') {
    button = (
      <Button
        onClick={state.interruptTask}
        colorScheme="red"
      >
        Stop
      </Button>
    );
  }

  return <HStack alignItems="center">{button}</HStack>;
}
