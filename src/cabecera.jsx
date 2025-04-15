import { useState, useEffect } from "react";
import { Cerrarsesion, variables, Validarsesion } from "./funciones";
import loadingProfile from "./assets/images/ProfileLoading.gif";
import logo from "./assets/images/Logo.png";

const Cabecera = () => {
  const [profileImage, setProfileImage] = useState(null);
  const [timer, setTimer] = useState(""); // State for the timer
  let tipo = "";
  Validarsesion();

  useEffect(() => {
    // Fetch the profile image
    if (sessionStorage.getItem("rol") <= 3) {
      tipo = "usuario";
    } else {
      tipo = "conductor";
    }
    fetch(variables("API") + "/" + tipo + "/profile", {
      method: "Post",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
      body: JSON.stringify({}),
    })
      .then((response) => response.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        setProfileImage(url);
      })
      .catch((error) => {
        setProfileImage(null);
        console.error("Error fetching profile image:", error);
      });

    // Calculate the logout time
    const logoutTime = sessionStorage.getItem("logoutTime");
    const currentTime = Date.now();
    const oneHour = 3600000; // 1 hour in milliseconds

    if (logoutTime) {
      const timeLeft = logoutTime - currentTime;

      if (timeLeft > 0) {
        // Set the timer
        const updateTimer = () => {
          const newTimeLeft = logoutTime - Date.now();
          if (newTimeLeft <= 0) {
            setTimer("00:00");
            Cerrarsesion();
          } else {
            const minutes = Math.floor(
              (newTimeLeft % (1000 * 60 * 60)) / (1000 * 60)
            );
            const seconds = Math.floor((newTimeLeft % (1000 * 60)) / 1000);
            setTimer(
              `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
                2,
                "0"
              )}`
            );
          }
        };

        updateTimer(); // Initial call to set the timer immediately
        const timerInterval = setInterval(updateTimer, 1000); // Update every second

        // Cleanup function to clear the interval if the component unmounts
        return () => clearInterval(timerInterval);
      } else {
        // If the time has already passed, log out immediately
        Cerrarsesion();
      }
    } else {
      // If there's no logout time, set it for 1 hour from now
      const newLogoutTime = currentTime + oneHour;
      sessionStorage.setItem("logoutTime", newLogoutTime);

      // Set a timeout to log out the user after 1 hour
      const logoutTimer = setTimeout(() => {
        Cerrarsesion();
      }, oneHour);

      // Set the timer for 1 hour
      const updateTimer = () => {
        const newTimeLeft = newLogoutTime - Date.now();
        if (newTimeLeft <= 0) {
          setTimer("00:00");
          Cerrarsesion();
        } else {
          const minutes = Math.floor(
            (newTimeLeft % (1000 * 60 * 60)) / (1000 * 60)
          );
          const seconds = Math.floor((newTimeLeft % (1000 * 60)) / 1000);
          setTimer(
            `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
              2,
              "0"
            )}`
          );
        }
      };

      updateTimer(); // Initial call to set the timer immediately
      const timerInterval = setInterval(updateTimer, 1000); // Update every second

      // Cleanup function to clear the interval if the component unmounts
      return () => {
        clearTimeout(logoutTimer);
        clearInterval(timerInterval);
      };
    }
  }, []);

  return (
    <>
      <nav
        className="navbar   shadow bg-supply navbar-expand-lg ftco_navbar ftco-navbar-light"
        id="ftco-navbar"
      >
        <div className="container  text-star my-3">
          <img src={logo} alt="" width={100} className="bg-white p-2 rounded" />

          <h1 className=" text-white  fw-bold fs-2 mt-3 ">
            We Supply - Programación
          </h1>
          <div className="social-media order-lg-last  my-3">
            <span className="mb-0 d-flex">
              <div className="dropdown bg-white rounded-3 ">
                <button
                  className="btn "
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <span className="text-black m-2 ">
                    {sessionStorage.getItem("user")}
                  </span>
                  <img
                    src={profileImage || loadingProfile}
                    className="rounded-circle border border-1 p-2"
                    width="50"
                    height="50"
                  />

                  <small className=" opacity-50 m-2 ">{timer}</small>
                </button>
                <ul className="dropdown-menu ">
                  <li className="text-center"> </li>
                  <li className="text-center m-2">
                    <span className="fw-light p-3">
                      {sessionStorage.getItem("documento")}
                    </span>
                    <span className="fw-light p-3">
                      {sessionStorage.getItem("email")}
                    </span>
                  </li>
                  <li className="text-center">
                    {" "}
                    <button
                      className="btn btn-danger"
                      onClick={() => Cerrarsesion()}
                    >
                      Cerrar sesión
                    </button>
                  </li>
                </ul>
              </div>
            </span>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Cabecera;
