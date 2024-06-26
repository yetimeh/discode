import React, { useCallback, useState, useEffect } from 'react';
import ReactFlow, { useNodesState, useEdgesState, addEdge, Node, Background,  Controls, Panel, ReactFlowProvider, MarkerType, useReactFlow, useStoreApi, ReactFlowInstance, Connection, BackgroundVariant } from 'reactflow';

import { useSnackbar } from 'notistack';

import 'reactflow/dist/base.css';


import DiscodeAPI from '../../api/discode';

import CommandNode from './nodes/command';
import SayNode from './nodes/say';
import Sidebar from './sidebar/sidebar';

import Then from './nodes/edges/then';
import { Box, Button, IconButton, Stack, Tab, Tabs } from '@mui/material';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { Add, HelpOutline, Refresh, Stop, Terminal } from '@mui/icons-material';
import GetChannel from './nodes/get_channel';

import io from "socket.io-client";
import { useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import CreateExtension from './dialogs/create_extension';
import RenameExtension from './dialogs/rename_extension';
import ClearMessagesNode from './nodes/clear_messages';
import KickUser from './nodes/kick_user';
import PrintNode from './nodes/print';



const socket = io("http://localhost:5000")


const nodeTypes = {
  command: CommandNode,
  say: SayNode,
  get_channel: GetChannel,
  clear_messages: ClearMessagesNode,
  kick_user: KickUser,
  print: PrintNode,
};

const edgeTypes = {
  then: Then
}




const api = new DiscodeAPI();


const ProjectHomeComponent = () => {


  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const { setViewport } = useReactFlow();
  const [extensionValue, setextensionValue] = useState(0);


  const [dialogCreatExtensionOpen, setDialogCreateExtensionOpen] = useState(false);
  const [dialogRenameExtensionOpen, setDialogRenameExtensionOpen] = useState(false);
  const [rightClickedExtension, setrightClickedExtension] = useState('')

  const [extensions, setExtensions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  var logs: {message: string, node: string, type: string, time: string}[] = [];

  const {state} = useLocation();

  console.log("State", state)

  var path = state.path;
  var project_name = state.project_name;

  useEffect(() => {

    console.log("Fetching project data")


    api.getProject(state.path).then((value) => {
      console.log("Fetched projetc data")

      setExtensions(value["extensions"])



      switch_extension(value["extensions"][0])

    })


  }, [])



  const switch_extension = (extension_name: string) => {
    setLoading(true)

    api.getExtension(state.path, extension_name).then((value) => {

        console.log("NODES_", value.nodes);


        value.nodes.map((node) => node.data.setNodes = setNodes);

        setNodes(value.nodes);
        setEdges(value.edges);

        setTimeout(() => {
          if (reactFlowInstance) {

            console.log("yip")
            reactFlowInstance.fitView({padding: 0.2});

          } else {
          }
        }, 1);


        // setViewport(value.viewport,);
    }).finally(() => {
      setLoading(false)
    })
  }


  const { enqueueSnackbar } = useSnackbar();


  useEffect(() => {


    socket.on('log', ({ message, node, type, time }) => {


      enqueueSnackbar(message,  {variant: type === "error" ? type : "success", anchorOrigin: {horizontal: "right", vertical: "bottom"}} );

      console.log(logs)

      window.electron.ipcRenderer.send("send-log", [...logs, {message, node, type, time}]);

      logs.push({message, node, type, time})
      return

    });

    return () => {
      socket.off('log');

    };
  }, []);

  const {  setCenter } = useReactFlow();
  const store = useStoreApi();

  const focusNode = (node_to_focus: any) => {

    const { nodeInternals } = store.getState();

    const nodes = Array.from(nodeInternals).map(([, node]) => node);


    if (nodes.length > 0) {
      console.log("yes")
      const node = nodes.find((node) => node.id === node_to_focus);

      console.log("Node found", node)

      const x = node!.position.x + node!.width! / 2;
      const y = node!.position.y + node!.height! / 2;
      const zoom = 1.85;

      console.log(x,y)

      setCenter(x, y, { zoom, duration: 10 });
    }}


  useEffect(() => {


    window.electron.ipcRenderer.on("clicked-log", (node) => {
      console.log("clicked node", node);
      focusNode(node)
    })

    return () => {

    }
  }, [])







  const onNodeDelete = useCallback((params: Node[]) => {

    setNodes((prevNodes) => {
      var nodes = prevNodes.map(element => {
        if (element.data.variables) {

          params.forEach(deleted_node => {
            element.data.variables = element.data.variables.filter((_var: string) => _var !== deleted_node.id);
          });
        }


        return element;
      }).filter((n) =>  !params.some((deleted_node) => deleted_node.id === n.id));


    console.log("_nodes", nodes)
    return nodes
    }

    );



  }, []);

  const onConnect = useCallback(
    (params: Connection) =>  {

      console.log("Source: ", params.source)
      console.log("Target: ", params.target)


      if (params.source!.includes("get")) {
        setNodes((prevNodes) => {
          const target_node = prevNodes.find(node => node.id === params.target);

          if (target_node) {

            const updatedData = { ...target_node.data };

            updatedData.variables.push(params.source);

            const updatedNodes = prevNodes.map(node => {
              if (node.id === params.target) {
                return { ...node, data: updatedData };
              }
              return node;
            });

            return updatedNodes;
          }


          return prevNodes;
        });

      }

      setEdges((eds) => addEdge(
        {...params, type: 'then',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: '#6ADFDA',
        },


        style: {
          strokeWidth: 2,
          stroke: 'rgba(120, 221, 227, 0.42)',
        },



        data: {

          "variables": params.source!.includes("command") ? ["Command Context"] :
              params.source!.includes("say") ?  ["TextChannel", "Message"] :
              params.source!.includes("get_channel") ? ["TextChannel", ] :
              params.source!.includes("clear_messages") ? ["List of Messages"] :
              params.source!.includes("kick_user") ? ["Member"] :
              params.source!.includes("print") ? [""] : "",
        }}, eds

        )

        )}, []

    );


  const onDragOver = useCallback((event: DragEvent) => {

    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
  }, []);


  const onDrop = useCallback(
    (event: DragEvent) => {


      event.preventDefault();

      const type = event.dataTransfer!.getData('application/reactflow');



      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }


      const position = reactFlowInstance!.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });



      const newNode = {
        id: type.toLowerCase().replace(" ", "_")+uuidv4(),
        type: type.toLowerCase().replace(" ", "_"),
        position,

        data: { label: `NOT IMPLEMENTED YET NODE`, variables: [], parameters: [], setNodes},
      };

      console.log("NEWNODE", newNode.id)

      setNodes((nds) => nds.concat(newNode));

    },
    [reactFlowInstance],
  );


  const reloadBot = () => {


    api.reloadCommands(path, project_name);

    enqueueSnackbar("Bot reloaded successfully", {variant: "success", autoHideDuration: 2000, anchorOrigin: {horizontal: "center", vertical: "bottom"}})
  }

  const openDocumentation = () => {
    window.electron.openDocumentation.open();
  }

  const openConsole = () => {
    window.electron.openConsole();
  }





  // const stopBot = (event) => {
  //   console.log("Stopping bot..")

  //   api.stopBot().then((value) => {
  //     enqueueSnackbar(value === 'running' ? "Bot is not running" : "Bot shutdown successfully", {variant: value === 'running' ? "error" : "success", autoHideDuration: 2000, anchorOrigin: {horizontal: "center", vertical: "bottom"}})

  //   })
  // }



  const handleAutoSave = useCallback(() => {


    setTimeout(() => {
      if (!reactFlowInstance) {return}


      let data = reactFlowInstance.toObject();



      console.log("REACTFLOW", data)
      console.log("nodes", nodes)

      socket.emit("auto-save", {
        path,
        name: extensions[extensionValue],
        node_data: data
      })
    }, 100);


  }, [nodes, edges])


  useEffect(() => {
    handleAutoSave();
  }, [nodes, handleAutoSave, edges]);


  const handleExtensionClick = (event: any, extension: string) => {
    switch_extension(extension);

  }


  const handleExtensionRename = (extension: string) => {
    setrightClickedExtension(extension);
    setDialogRenameExtensionOpen(true);

  }

  const handleDialogRenameExtension = (extension: string, renamed_extension: string, is_deleted: boolean) => {
    setDialogRenameExtensionOpen(false);

    if (is_deleted === true) {
      setExtensions((prevExtensions) => prevExtensions.filter(e => e !== extension));

      return
    }

    else if (extension && renamed_extension) {
      setExtensions((prevExtensions) => {
        return prevExtensions.map((e) => e === extension ? renamed_extension : e)

      })
    }


  }

  const handleCreateNewExtension = () => {
    setDialogCreateExtensionOpen(true);
  }

  const handleDialogCreateExtension = (event: any,  value: {extension: string})  => {
    setDialogCreateExtensionOpen(!dialogCreatExtensionOpen);

    if (value) {


      setExtensions((prevExtensions) => {
        return [...prevExtensions,  value["extension"]];
      });


      switch_extension(value["extension"]);
      setextensionValue(extensions.length);


      setTimeout(() => {
        reactFlowInstance!.fitView();
      }, 1);
    }




  }




  return (


  <div  style={{
        height: "100vh",
        width: "100wh"


      }}>



      <ReactFlow


        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodesDelete={onNodeDelete}

        nodeTypes={nodeTypes}
        // @ts-ignore
        edgeTypes={edgeTypes}
        // @ts-ignore
        onDrop={onDrop}
        // @ts-ignore
        onDragOver={onDragOver}
        onInit={setReactFlowInstance}
        onChange={handleAutoSave}
        onLoad={() => {

            reactFlowInstance!.fitView({padding: 0.2});


        }}






      >


        <Panel position='top-center'>


          <Box sx={{ maxWidth: { xs: 320, sm: 600 }}}>

            <Stack direction='row-reverse'>
              <IconButton sx={{color: 'pink'}} onClick={handleCreateNewExtension}><Add /></IconButton>



              <Tabs

                variant="scrollable"
                value={extensionValue}
                onChange={(e, value) => setextensionValue(value)}
                classes={{

                  flexContainer: "flexContainer",
                  indicator: "indicator"
                }}

                scrollButtons

                TabIndicatorProps={{style: {background: "transparent", justifyContent: 'center'}, children: <span />}}


                sx={{


                  "& .MuiTab-root.Mui-selected": {
                    color: 'blue'
                  },

                  "& .indicator": {
                    display: "flex",
                    justifyContent: "center",
                    backgroundColor: "transparent",
                    "& > span": {
                      maxWidth: 40,
                      width: "100%",
                      backgroundColor: "cyan"
                    }
                  }


                }}


              >

                {extensions.length !== 0 ? extensions.map((value, index) => (
                  <Tab label={value} onClick={(event) => handleExtensionClick(event, value)} onContextMenu={() => handleExtensionRename(value)}  sx={{color: 'rgba(255, 255, 255, 0.7)', textTransform: 'none', fontSize: 16}} />

                )) : <Tab label="You don't have any extensions created" sx={{color: 'rgb(234, 125, 125)', textTransform: 'none', fontSize: 15}}/>}


            </Tabs>

          </Stack>

          </Box>


        </Panel>

        <Panel position='top-left' >

          <Sidebar />

        </Panel>

        <Panel position='top-right' >
          <div className='flex flex-col m-2 '>
            <div className='mb-5'>

              <Button fullWidth variant='contained' size="small" color='success' onClick={reloadBot} startIcon={<Refresh /> } >Reload bot</Button>


            </div>

            <div className='mb-5'>

              <Button size="small" variant='contained' color='secondary' onClick={openConsole} startIcon={< Terminal />} >Open console</Button>

            </div>


            <Button size="small" variant='contained' color='info' onClick={openDocumentation} startIcon={< HelpOutline />} >Help?</Button>

          </div>

        </Panel>

        <Background  />
        {/* <MiniMap /> */}
        <Controls />


      </ReactFlow>

      <CreateExtension path={path} dialogOpen={dialogCreatExtensionOpen} handleDialogClose={handleDialogCreateExtension} />

      <RenameExtension extension={rightClickedExtension} path={path}  dialogOpen={dialogRenameExtensionOpen} handleDialogClose={handleDialogRenameExtension} />


      <Backdrop
      sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 ,}}
      open={loading}

    >
    <CircularProgress color="inherit" />

      </Backdrop>

    </div>







  );
};

const ProjectHome = () => {
  return (
    <ReactFlowProvider >

      <ProjectHomeComponent />


    </ReactFlowProvider>


   );
}

export default ProjectHome;
