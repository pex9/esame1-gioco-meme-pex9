import React, { useContext } from "react";
import { useNavigate } from 'react-router-dom';
import { Col, Container, Button, Card, Row } from "react-bootstrap";
import AppContext from "../AppContext";
import MyNavbar from './MyNavbar';
import DefaultRoute from "./DefaultRoute";
// componente per visualizzare il profilo dell'utente dato lo user passato come props, mostra info come email e nome
function MyProfileComp(props) {
    return (
        <Card className="text-center shadow card-profile-costom" >
            <Card.Body>
                <Card.Title>Utente</Card.Title>
                <Card.Text><strong>Email:</strong> {props.user.username}</Card.Text>
                <Card.Text><strong>Name:</strong> {props.user.name}</Card.Text>
            </Card.Body>
        </Card>
    );
}
function HistoryComp() {
    const navigate = useNavigate();

    const handleHistoryClick = () => {
        navigate('/history'); // vai alla pagina di storico
    };

    return (
        <Card className="text-center shadow card-profile-costom" >
            <Card.Body>
                <Card.Title>History</Card.Title>
                <Button variant="primary" onClick={handleHistoryClick}>
                    View History
                </Button>
            </Card.Body>
        </Card>
    );
}


function ProfileRoute(props) {
    // prendo il context per verificare se l'utente è loggato, altrimenti non può accedere alla pagina e mostro la DefaultRoute per ritornare alla home
    const context = useContext(AppContext);
    return (
      <>
        {!context.loginState.loggedIn ? (
          <DefaultRoute />
        ) : (
          <>
            <MyNavbar type={props.type} />
            <Container>
              <Row>
                <Col xs={6} md={6} className="mt-4">
                  <MyProfileComp user={context.loginState.user} />
                </Col>
                <Col xs={6} md={6} className="mt-4">
                  <HistoryComp />
                </Col>
              </Row>
            </Container>
          </>
        )}
      </>
    );
  }
export default ProfileRoute;