/** @format */
"use client";
import { createContext, useEffect, useRef, useState } from "react";

import { NavbarAdminComponent } from "@/components/navbar";
import Search from "@/assets/search.png";
import { axiosInstance } from "@/axios/axios";
import AdminEventCard from "@/components/admin/adminCard";
import { useDebounce } from "use-debounce";
import Image from "next/image";
import Swal from "sweetalert2";
import ModalEventEditComponent from "@/components/admin/modal_eventEdit";
import { Pagination } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material";

export const EventContext = createContext(null);
/** @format */
function Page() {
  const [search, setSearch] = useState("");
  const [value] = useDebounce(search, 500);
  const [events, setEvents] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [page, setPage] = useState(1);
  const theme = createTheme();
  const handleChange = (event, value) => {
    setPage(value);
  };

  const hapus = (id, event_name) => {
    Swal.fire({
      title: "are you sure you want to delete  " + event_name + " ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosInstance()
          .delete("/events/" + id)
          .then(() => {
            fetchEvents();
          })
          .catch((err) => console.log(err));
      }
    });
  };

  const fetchEvents = () => {
    axiosInstance()
      .get("/events/page/" + page, {
        params: {
          event_name: search,
        },
      })
      .then((res) => {
        setEvents(res.data.result);
        setPageCount(res.data.pageCount);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchEvents();
  }, [value, page]);
  const upload = useRef(null);
  return (
    <>
      <NavbarAdminComponent />
      <EventContext.Provider value={fetchEvents}>
        <div className="w-full">
          <div className="flex flex-col justify-center  max-w-[1000px] w-full items-center m-auto  ">
            <h1 className=" text-2xl font-bold m-4">My Event</h1>
            <div className="py-5 w-full flex justify-between">
              <div className="flex px-3 items-center gap-3  border-gray-300 border-b w-72  p-2 justify-between">
                <Image src={Search} alt="" className=" w-3 h-3" />
                <input
                  type="text"
                  placeholder="Type any event here"
                  className=" outline-none             "
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className=" md:mr-24 flex items-center">
                <ModalEventEditComponent button="Add Event" />
              </div>
            </div>

            <table className=" w-56 md:w-full">
              <thead>
                <tr className=" text-center ">
                  <th width="30%">IMAGE</th>
                  <th width="40%">EVENT NAME</th>
                  {/* <th>PRICE</th> */}
                </tr>
              </thead>
              <tbody>
                {events.map((event, key) => (
                  <AdminEventCard
                    {...event}
                    key={key}
                    edit={() => edit(event.id)}
                    hapus={() => hapus(event.id, event.event_name)}
                  />
                ))}
              </tbody>
            </table>

            <ThemeProvider theme={theme}>
              <Pagination
                count={pageCount}
                page={page}
                color="primary"
                className=" flex justify-center mb-4"
                onChange={handleChange}
              />
            </ThemeProvider>
          </div>
        </div>
      </EventContext.Provider>
    </>
  );
}

export default Page;
