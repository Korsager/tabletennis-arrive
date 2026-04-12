import { useState } from "react";
import { useLocation } from "react-router-dom";
import Home from "./Home";
import Tournament from "./Tournament";

const Index = () => {
  const location = useLocation();
  const isTournamentView = location.pathname === "/tournament";

  return (
    <div>
      {isTournamentView ? <Tournament /> : <Home />}
    </div>
  );
};

export default Index;
