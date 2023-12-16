import { Box, Grid, GridItem } from "@chakra-ui/react";
import { useState } from "react";
import Chatbox from "../components/Chatbox";
import MyChats from "../components/MyChats";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import { ChatState } from "../Context/ChatProvider";

const Chatpage = () => {
  const [fetchAgain, setFetchAgain] = useState(false);
  const { user } = ChatState();

  return (
    <div style={{ width: "100%" }}>
      {user && <SideDrawer />}
      <Grid width="100vw"  templateColumns='repeat(6, 1fr)' gap={2}>
        <GridItem colSpan={2} overflow-y="hidden">
          {user && (
            <Box h="91.5vh" w="90vw" p="10px">
              <MyChats fetchAgain={fetchAgain} />
            </Box>
          )}

        </GridItem>
        <GridItem colStart={3} colEnd={7}  alignContent="center">
          {user && (
            <Box h="100%" w="90vw" p="10px">
              <Chatbox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
            </Box>
          
          )}
        </GridItem>
      </Grid>
    </div>
  );
};

export default Chatpage;
