// React & React Router & React Query Modules;
import React, { useEffect, useState } from "react";
import { useMutation } from "react-query";

// Components Imported;
import Canvas from "../components/DBDisplay/Canvas";
import DisplayHeader from "../components/DBDisplay/DisplayHeader";
import FeatureTab from "../components/DBDisplay/FeatureTab";
import Sidebar from "../components/DBDisplay/Sidebar";


// Miscellaneous - axios for REST API request, DataStore for global state management, AppShell for application page frame;
import axios from "axios";
import DataStore from "../Store";
import { AppShell } from "@mantine/core";

interface stateChangeProps {
  user: {
    email: string | null;
    id: string | null;
    name: string | null;
    picture: string | null;
  };
  setLoggedIn: (e: boolean) => void;
  loggedIn: boolean;
}

/* "DBDisplay" Component - database visualization application page; only accessible when user is authorized; */
export default function DBDisplay({
  user,
  setLoggedIn,
  loggedIn,
}: stateChangeProps) {
  /* Server Cache State or Form Input State
  "fetchedData" - a state that stores database table model and is used to render database schema tables;
  "tablename" - a state that stores input data (table name for a new table) from "ADD TABLE" feature;
  */
  const [fetchedData, setFetchedData] = useState({});
  const [tablename, setTablename] = useState("");

  /* UI State
  "sideBarOpened" - a state that opens and closes the side bar for database connection;
  "menuPopUpOpened" - a state that opens and closes the Menu Pop Up for when burger icon is clicked;
  "numEdit" - a state that tracks the table editting activity
  "historyClick" - a state that tracks user click on Time Travel feature
  */
  const [sideBarOpened, setSideBarOpened] = useState(false);
  const [menuPopUpOpened, setMenuPopUpOpened] = useState(false);
  const [numEdit, setNumEdit] = useState(0);
  const [historyClick, setHistoryClick] = useState(0);

  /* useMutation for handling 'POST' request to '/api/getSchema' route for DB schema dump; 
  initiate "fetchedData" and Map objects in "DataStore" 
  onSuccess: update connectedToDB global state to "true" and close the side bar
  */
  const { isLoading, isError, mutate } = useMutation(
    (dataToSend: object) => {
      return axios.post("/api/getSchema", dataToSend).then((res) => {
        setFetchedData(res.data);
        DataStore.setData(res.data);
        DataStore.setQuery([{ type: "", query: "" }]);

        localStorage.Data = JSON.stringify(
          Array.from(DataStore.store.entries())
        );

        localStorage.Query = JSON.stringify(
          Array.from(DataStore.queries.entries())
        );

        //Console Log for Testing - "Retrieved data" from server and "DataStore" after initiating Map objects
        console.log("this is retrieved data from server,: ", res.data);
        console.log("this is dataStore: ", DataStore);
      });
    },
    {
      onSuccess: () => {
        DataStore.connect();

        localStorage.dbConnect = "true";
        localStorage.count = 0;
        setSideBarOpened(false);
      },
    }
  );

  /* useEffect:
  "loggedIn" gets set to "true"; localStorage also gets set to "true"
  gets triggered when table editting is done or History list is clicked.
  Client-side caching implemented with latest update of table model. 
  */

  // useEffect(() => {
  //   console.log("hi from localStrogesa");
  //   localStorage.Query = JSON.stringify(
  //     Array.from(DataStore.queries.entries())
  //   );
  //   localStorage.Data = JSON.stringify(Array.from(DataStore.store.entries()));
  // }, [fetchedData]);

  // useEffect(() => {
  //   // setLoggedIn(true);
  //   // localStorage.setItem("isLoggedIn", "true");
  //   // console.log(localStorage.dbConnect);
  //   // console.log(localStorage.count);
  //   // console.log(localStorage.isLoggedIn);

  //   if (
  //     localStorage.isLoggedIn &&
  //     localStorage.dbConnect === "true" &&
  //     localStorage.count >= 0
  //   ) {
  //     console.log("hola");
  //     const savedData = new Map(JSON.parse(localStorage.Data));
  //     const latestData: any = savedData.get(savedData.size - 1);
  //     console.log("this is latest DAta: ", latestData);
  //     // if (savedData) {
  //     DataStore.connect();
  //     setFetchedData(latestData);
  //     console.log("this is saved: ", latestData);
  //     // }
  //   }
  // }, []);

  // console.log("fetchedData in DBDIsply", fetchedData);

  // useEffect(() => {
  //   localStorage.clear();
  // }, [DataStore.connectedToDB]);

  //OLD VERSION

  useEffect(() => {
    setLoggedIn(true);
    localStorage.setItem("isLoggedIn", "true");

    if (loggedIn && DataStore.ind > 0) {
      const savedData = DataStore.getData(DataStore.store.size - 1);
      if (savedData) {
        setFetchedData(savedData);
        console.log("this is saved: ", savedData);
      }
    }
  }, []);

  return (
    <AppShell
      padding="md"
      header={
        <DisplayHeader
          name={user.name}
          picture={user.picture}
          menuPopUpOpened={menuPopUpOpened}
          setMenuPopUpOpened={setMenuPopUpOpened}
          setLoggedIn={setLoggedIn}
        />
      }
      // navbarOffsetBreakpoint="sm"
      navbar={
        <FeatureTab
          setTablename={setTablename}
          setFetchedData={setFetchedData}
          fetchedData={fetchedData}
          historyClick={historyClick}
          setHistoryClick={setHistoryClick}
        ></FeatureTab>
      }
      styles={(theme) => ({
        root: { height: "100%" },
        body: { height: "100%" },
        main: {
          backgroundColor: "transparent",
          // backgroundColor:
          //   theme.colorScheme === "dark"
          //     ? theme.colors.dark[8]
          //     : theme.colors.gray[0],
        },
      })}
    >
      <Sidebar
        sideBarOpened={sideBarOpened}
        setSideBarOpened={setSideBarOpened}
        isLoadingProps={isLoading}
        isErrorProps={isError}
        mutate={mutate}
      />
      <Canvas
        isLoadingProps={isLoading}
        isErrorProps={isError}
        fetchedData={fetchedData}
        setFetchedData={setFetchedData}
        setSideBarOpened={setSideBarOpened}
        setNumEdit={setNumEdit}
        numEdit={numEdit}
      />
    </AppShell>
  );
}
