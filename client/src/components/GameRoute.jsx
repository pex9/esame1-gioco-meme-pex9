import { useContext, useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Container, Spinner, Form, Button, Card, ListGroup, ListGroupItem } from "react-bootstrap";
import AppContext from "../AppContext";
import ErrorView from "./Error";
import MyNavbar from "./Navbar";
import API from "../API";
import dayjs from "dayjs";

function ImageComponent(props) {
  return (
    <>
      <div>
        <h1> ROUND NUMERO {props.round}</h1>
        {props.error && <p style={{ color: 'red' }}>{props.error}</p>}
        {props.memeImage ? (
          <img src={props.memeImage.url} alt="Meme" style={{ width: '500px', height: '500px', objectFit: 'cover' }} />
        ) : (
          <p> Caricamento...</p>
        )}
      </div>
    </>
  );
}

function InfoComponent(props) {
  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      {<h1>Punteggio Totale della partita : {props.score}</h1>}
      <h2>Scelte fatte:</h2>
      <ListGroup style={{ marginBottom: '20px' }}>
        {props.choices.map((choice, index) => (
          <ListGroupItem key={index}>
            <strong>Round {index + 1}:</strong> {choice}
          </ListGroupItem>
        ))}
      </ListGroup>
      <Button variant="primary" onClick={props.handleRetry}>
        Riprova
      </Button>
    </div>
  );
}

function MessageComponent(props) {
  const context = useContext(AppContext);
  const loginState = context.loginState;
  const handleNextTurn = () => {
    props.setTimeLeft(30); // Reset the timer for the next turn
    props.setEndRound(false);
    if (loginState.loggedIn == true) {
      if (props.round < 3) {
        props.setRound(props.round + 1);
      } else {
        props.handleSaveGame()
        props.setGameOver(true);
      }
    }
    else {
      props.setGameOver(true);
    }
  };

  let previoustext = "";
  let correct_answer = [];
 
  for (let i = 0; i < props.captions.length; i++) {
    if (props.captions[i].id == props.choices[props.choices.length - 1]) {
      previoustext = props.captions[i].text;
      break;
    }
  }

  // Populate correct_answer array
  
  correct_answer = props.captions.filter((caption) => caption.isCorrect);

  return (
    <>
      <ImageComponent memeImage={props.memeImage} error={props.error} round={props.round} />
      <div>
        <h2>{props.correct ? 'Risposta corretta' : 'Risposta sbagliata'}</h2>
        <h1>Punteggio corrente {props.score}</h1>
        <h2>Scelta fatta in questo turno: </h2>
        <h2>{previoustext!="" ? previoustext : "Didascalia non scelta"}</h2>
        <ListGroup className="custom-list-group">
          {correct_answer.map((answer, index) => (
            <ListGroupItem key={index} className="custom-list-group-item">
              <strong>Risposta corretta:</strong> {answer.text}
            </ListGroupItem>
          ))}
        </ListGroup>
        <Button variant="primary" onClick={handleNextTurn}>{loginState.loggedIn === true ? "Prossimo turno" : "Riepilogo "}</Button>
        <Button variant="danger" onClick={props.exitGame}>{loginState.loggedIn === true ? "Abbandona partita" : "Home "}</Button>
      </div>
    </>
  );
}


function CaptionComponentForm(props) {
  useEffect(() => {
    if (props.captions.length > 0) {
      props.setSelectedCaption(props.captions[0].id);
    }
  }, [props.captions]);

  const handleCaptionChange = (event) => {
    props.setSelectedCaption(event.target.value);
  };
  
  const handleSubmit = (event) => {
    event.preventDefault();
    // i need to check if the answer is correct
    if (props.selectedCaption != -1) {
      for (let i = 0; i < props.captions.length; i++) {
        console.log(props.captions[i].id);
        if (props.captions[i].id == props.selectedCaption) {
          if (props.captions[i].isCorrect) {
            props.setScore(props.score + 5);
            props.setAnswer(true);
          }
          break;
        }
      }
    }
    if (props.round <= 3) {
      if (props.selectedCaption != -1) {
        props.setChoices([...props.choices, props.selectedCaption]);
      }
      props.setEndRound(true);
    } else {
      if (props.selectedCaption != -1) {
        props.setChoices([...props.choices, props.selectedCaption]);
      }
      props.handleSaveGame();
      props.setGameOver(true);
    }

  };

  useEffect(() => {
    if (props.timeLeft === 0) {
      if (props.round <= 3) {
        props.setEndRound(true);
      } else {
        props.setGameOver(true);
      }
      return;
    }

    const intervalId = setInterval(() => {
      props.setTimeLeft(props.timeLeft - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [props.timeLeft]);

  return (
    <>
      <div className="countdown-timer">Tempo rimanente: {props.timeLeft} secondi</div>
      <Card className="card-custom">
        <Card.Header className="card-header-custom">
          <Card.Subtitle className="card-subtitle-custom">Seleziona la Didascalia che si adatta meglio a questo meme</Card.Subtitle>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formCaption" className="form-group-custom">
              <Form.Control as="select" onChange={handleCaptionChange}>
                <option value="-1">Seleziona una possibile didascalia </option>
                {props.captions.map((caption, index) => (
                  <option key={index} value={caption.id}>
                    {caption.text}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Button variant="primary" className="button-custom" type="submit">
              Conferma
            </Button>
            <Button variant="danger" onClick={props.exitGame}>
              Abbandona Partita
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </>
  );
}

function MemeComponent() {
  const [memeImage, setMemeImage] = useState(null);
  const [error, setError] = useState(null);
  const [listmeme, setListMeme] = useState([]);
  const [round, setRound] = useState(1);
  const [captions, setCaptions] = useState([]);
  const [selectedCaption, setSelectedCaption] = useState(null);
  const [choices, setChoices] = useState([]);
  const [score, setScore] = useState(0);
  const [answer, setAnswer] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [endRound, setEndRound] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  const context = useContext(AppContext);
  const loginState = context.loginState;


  const navigate = useNavigate();

  const handleRetry = () => {
    setScore(0);
    setGameOver(false);
    setListMeme([]);
    setRound(1);
    setChoices([]);
    setEndRound(false);
    setTimeLeft(30);
  };
  const exitGame = () => {
    navigate("/");
  }
  const handleSaveGame = async () => {
    const creationDate = dayjs().format('YYYY-MM-DD');
    API.saveGame(score, creationDate).then((response) => {
      if (response.ok) {
        setGameOver(true);
      }
    });
  };

  useEffect(() => {
    const fetchMemeImage = async () => {
      try {
        let image = null;
        let isMemePresent = true;
        while (isMemePresent) {
          console.log(listmeme)
          image = await API.getMemeImage();
          if (!listmeme.includes(image.url)) {
            isMemePresent = false;
          }
        }
        setMemeImage(image);
        setListMeme(prevListMeme => [...prevListMeme, image.url]);

        const captions = await API.getCaptions(image.id);
        setCaptions(captions);
      } catch (err) {
        setError(err.error || 'Unknown error');
      }
    };

    if (round > 1 || memeImage === null) {
      fetchMemeImage();
    }
  }, [round]);

  if (!gameOver) {
    if (!endRound) {
      return (
        <>
          <ImageComponent memeImage={memeImage} error={error} round={round} />
          <CaptionComponentForm
            captions={captions}
            selectedCaption={selectedCaption}
            endRound={endRound}
            setEndRound={setEndRound}
            setSelectedCaption={setSelectedCaption}
            round={round}
            setRound={setRound}
            setChoices={setChoices}
            choices={choices}
            setGameOver={setGameOver}
            timeLeft={timeLeft}
            setTimeLeft={setTimeLeft}
            exitGame={exitGame}
            handleSaveGame={handleSaveGame}
            setScore={setScore}
            score={score}
            setAnswer={setAnswer}
          />
        </>
      );
    } else {
      return (
        <MessageComponent
          round={round}
          setTimeLeft={setTimeLeft}
          setRound={setRound}
          setChoices={setChoices}
          choices={choices}
          setGameOver={setGameOver}
          endRound={endRound}
          setScore={setScore}
          score={score}
          setEndRound={setEndRound}
          memeImage={memeImage}
          captions={captions}
          error={error}
          exitGame={exitGame}
          handleSaveGame={handleSaveGame}
          answer={answer}
        />
      );
    }
  } else {
    return (
      <InfoComponent listmeme={listmeme} score={score} handleRetry={handleRetry} error={error} round={round} choices={choices} />
    );
  }
}

function GameRoute(props) {
  const context = useContext(AppContext);
  const loadingState = context.loadingState;
  const handleErrorState = context.handleErrorState;

  return (
    <>
      {handleErrorState.errMsg || context.gameStarted ? (
        <ErrorView />
      ) : (
        <>
          {loadingState.loading ? (
            <Container className="my-5 text-center">
              <Spinner variant="primary" />
            </Container>
          ) : (
            <>
              <MyNavbar type={props.type} />
              <MemeComponent />
            </>
          )}
        </>
      )}
    </>
  );
}

export default GameRoute;