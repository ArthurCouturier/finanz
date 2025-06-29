import { createBrowserRouter } from "react-router-dom";
import Tjm from "./pages/Tjm";
import House from "./pages/House";
import ChooseConfig from "./pages/ChooseConfig";

const router = createBrowserRouter([
    {
        path: "/tjm",
        element: <Tjm />
    },
    {
        path: "/house",
        element: <House />
    },
    {
        path: "/house/:uuid",
        element: <House />
    },
    {
        path: "/chooseConfig/:type",
        element: <ChooseConfig />
    }
]);

export default router;
