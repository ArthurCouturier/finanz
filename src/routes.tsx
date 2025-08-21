import { createBrowserRouter } from "react-router-dom";
import Tjm from "./pages/Tjm";
import House from "./pages/House";
import ChooseConfig from "./pages/ChooseConfig";
import Home from "./pages/Home";
import Restaurant from "./pages/Restaurant";
import Global from "./pages/Global";
import CategoryView from "./pages/CategoryView";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Home />
    },
    {
        path: "/tjm",
        element: <Tjm />
    },
    {
        path: "/tjm/:uuid",
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
        path: "/restaurant",
        element: <Restaurant />
    },
    {
        path: "/restaurant/:uuid",
        element: <Restaurant />
    },
    {
        path: "/chooseConfig/:type",
        element: <ChooseConfig />
    },
    {
        path: "/global",
        element: <Global />
    },
    {
        path: "/category/:category",
        element: <CategoryView />
    }
]);

export default router;
