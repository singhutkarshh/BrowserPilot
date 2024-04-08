import { Box, ChakraProvider, Heading, HStack } from '@chakra-ui/react';
import React from 'react';
import TaskUI from './TaskUI';
import "../pages/Content/content.styles.css"

const App = () => {
  return (
    <ChakraProvider>
      <Box p="8" fontSize="lg" w="full">
        <HStack mb={4} alignItems="center">
          <Heading as="h1" size="lg" flex={1}>
            Booksiey Chat
          </Heading>
        </HStack>
        <TaskUI />
      </Box>
    </ChakraProvider>
  );
};

export default App;
