import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Spinner, Button, Row, Col } from "react-bootstrap";
import Table from 'react-bootstrap/Table';
import AppContext from "../AppContext";
import MyNavbar from './MyNavbar';
import API from "../API";
import dayjs from 'dayjs';
import DefaultRoute from './DefaultRoute';

function MyHistoryTable(props) {
  const [sort, setSort] = useState('desc');

  const listgamesstate = props.history;
  const sortedgames = [...listgamesstate];
  const navigate = useNavigate();
  if (sort === 'asc') {
    sortedgames.sort((e1, e2) => {
      if (!e1.created_at) return -1;
      else if (!e2.created_at) return 1;
      else return dayjs(e1.created_at).diff(dayjs(e2.created_at));
    });
  } else if (sort === 'desc') {
    sortedgames.sort((e1, e2) => {
      if (!e1.created_at) return 1;
      else if (!e2.created_at) return -1;
      else return dayjs(e2.created_at).diff(dayjs(e1.created_at));
    });
  }

  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };

  return (
    <Container>
      <h1>Storico</h1>
      <Row>
        <Col>
          <Button variant="danger" onClick={handleBack}>
            Indietro
          </Button>
        </Col>
      </Row>
      {sortedgames.length === 0 ? (
        <h2>Non ci sono ancora partite registrate per questo utente.</h2>
      ) : (
        <Table striped bordered hover className='m-4'>
          <thead className="text-center" >
            <tr>
              <th>
                Data partita
                {sort === 'desc' ? (
                  <i className="mx-1 bi bi-sort-down" onClick={() => setSort('asc')} />
                ) : (
                  <i className="mx-1 bi bi-sort-up" onClick={() => setSort('desc')} />
                )}
              </th>
              <th>Punteggio</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody className="text-center">
            {sortedgames.map((game) => (
              <tr key={game.id}>
                <td>{dayjs(game.created_at).format('MMMM D, YYYY HH:mm')}</td>
                <td>{game.score.split(',').map(Number).reduce((acc, score) => acc + score, 0)}</td>
                <td>
                  <Button variant='primary' className='rounded-circle' onClick={() => {
                    navigate(`/viewgame/${game.id}`);
                  }}>
                    <i className="bi bi-eye" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

    </Container>
  );
}

function HistoryRoute(props) {
  const [history, setHistory] = useState([]);
  const [localHistoryLoading, setLocalHistoryLoading] = useState(true); // inizia il caricamento
  const context = useContext(AppContext);
  const loginState = context.loginState.loggedIn;

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await API.getGames();
        setHistory(response);
        setLocalHistoryLoading(false);
      } catch (error) {
        setLocalHistoryLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <>
      {loginState == false ?
        <DefaultRoute /> :
        <>
          {localHistoryLoading == true ?
            <Container className='my-5 text-center'> <Spinner animation="border" variant='primary' /> </Container> :
            <>
              <MyNavbar type={props.type} />
              <MyHistoryTable history={history} />
            </>
          }
        </>
      }
    </>
  );
}




export default HistoryRoute;
