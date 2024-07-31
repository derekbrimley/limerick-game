import React from 'react'
import './App.css'
import socketIOClient from 'socket.io-client'
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';

class CircularLinkedList<T> {  
  private head: ListNode<T> | null;
  
  constructor() {
    this.head = null;
  }

  append(data: T): void {
    const newNode = new ListNode(data);
    if (!this.head) {
      this.head = newNode;
      newNode.next = newNode; // Point to itself for circularity
    } else {
      newNode.next = this.head.next;
      this.head.next = newNode;
    }
  }

  getWhere(username: string): ListNode<T> | null {
    if (!this.head) return null;
    let node: ListNode<T> = this.head;
    do {
      if (node.data === username) return node;
      node = node.next!;
    } while (node !== this.head);
    return null;
  }
}

class ListNode<T> {
  data: T;
  next: ListNode<T> | null;

  constructor(data: T) {
    this.data = data;
    this.next = null;
  }
}

interface ILineInput {
  lineName: string
  finalLine: { assignedTo: string, value: string, show: boolean }
  editingLine: string
  hint: string
  onChange: (val: string) => void
  onSubmit: () => void
}

const LineInput: React.FC<ILineInput> = props => {
  const submitOnEnter = (key: string) => {
    if (key === 'Enter') {
      props.onSubmit();
    }
  };

  if (!props.finalLine.show) {
    return null;
  }
  return (
    props.finalLine.show && (
      <div style={{ padding: 8 }}>
        {props.finalLine.value ? (
          props.finalLine.value
        ) : (
          <span style={{ display: 'flex' }}>
            <TextField
              style={{ width: 400 }}
              label={props.lineName}
              value={props.editingLine}
              onChange={ev => props.onChange(ev.target.value)}
              helperText={`e.g. ${props.hint}`}
              onKeyDown={ev => submitOnEnter(ev.key)}
            />
            <Button disabled={!props.editingLine} onClick={props.onSubmit}>
              Save Line
            </Button>
          </span>
        )}
      </div>
    )
  )
}

interface ILine {
  value: string;
  assignedTo: string;
  show: boolean;
}

interface ICompletedPoemBox {
  poem: {
    username: string
    line1: ILine
    line2: ILine
    line3: ILine
    line4: ILine
    line5: ILine
  }
}

const CompletedPoemBox: React.FC<ICompletedPoemBox> = props => {
  return (
    <Card style={{ margin: 16 }}>
      <CardContent>
        <div className='poem-header'>Poem started by {props.poem.username}</div>
        <div style={{ padding: 8 }}>{props.poem.line1.value}</div>
        <div style={{ padding: 8 }}>{props.poem.line2.value}</div>
        <div style={{ padding: 8 }}>{props.poem.line3.value}</div>
        <div style={{ padding: 8 }}>{props.poem.line4.value}</div>
        <div style={{ padding: 8 }}>{props.poem.line5.value}</div>
      </CardContent>
    </Card>
  );
}

interface IPoemProps {
  poem: {
    poemId: string
    username: string
    line1: ILine
    line2: ILine
    line3: ILine
    line4: ILine
    line5: ILine
  }
  handleSubmitLine1: (line: string, poemId: string) => void
  handleSubmitLine2: (line: string, poemId: string) => void
  handleSubmitLine3: (line: string, poemId: string) => void
  handleSubmitLine4: (line: string, poemId: string) => void
  handleSubmitLine5: (line: string, poemId: string) => void
}

class PoemBox extends React.Component<IPoemProps> {
  state = {
    line1: '',
    line2: '',
    line3: '',
    line4: '',
    line5: ''
  }
  render() {
    return (
      <Card style={{ margin: 16 }}>
        <CardContent>
          <div className='poem-header'>Poem started by {this.props.poem.username}</div>
          <LineInput
            lineName='Line 1'
            hint='There once was a man from Peru'
            editingLine={this.state.line1}
            finalLine={this.props.poem.line1}
            onSubmit={() => this.props.handleSubmitLine1(this.state.line1, this.props.poem.poemId)}
            onChange={line1 => this.setState({ line1 })}
          />
          <LineInput
            lineName='Line 2'
            hint='Who dreamed he was eating his shoe'
            editingLine={this.state.line2}
            finalLine={this.props.poem.line2}
            onSubmit={() => this.props.handleSubmitLine2(this.state.line2, this.props.poem.poemId)}
            onChange={line2 => this.setState({ line2 })}
          />
          <LineInput
            lineName='Line 3'
            hint='He woke with a fright'
            editingLine={this.state.line3}
            finalLine={this.props.poem.line3}
            onSubmit={() => this.props.handleSubmitLine3(this.state.line3, this.props.poem.poemId)}
            onChange={line3 => this.setState({ line3 })}
          />
          <LineInput
            lineName='Line 4'
            hint='In the middle of the night'
            editingLine={this.state.line4}
            finalLine={this.props.poem.line4}
            onSubmit={() => this.props.handleSubmitLine4(this.state.line4, this.props.poem.poemId)}
            onChange={line4 => this.setState({ line4 })}
          />
          <LineInput
            lineName='Line 5'
            hint='To find that his dream had come true!'
            editingLine={this.state.line5}
            finalLine={this.props.poem.line5}
            onSubmit={() => this.props.handleSubmitLine5(this.state.line5, this.props.poem.poemId)}
            onChange={line5 => this.setState({ line5 })}
          />
        </CardContent>
      </Card>
    )
  }
}

interface IPoem {
    poemId: string
    username: string
    line1: ILine
    line2: ILine
    line3: ILine
    line4: ILine
    line5: ILine
}

interface IState {
  username: string
  poems: Array<IPoem>
  showCompleted: boolean
  gameRoom: string
  joinGameRoom: string
  gameStarted: boolean
}

class App extends React.Component<{}, IState> {
  state: IState = {
    username: '',
    poems: [],
    showCompleted: false,
    gameRoom: '',
    joinGameRoom: '',
    gameStarted: false,
  }
  socket: SocketIOClient.Socket = socketIOClient();

  componentDidMount() {
    this.socket.on('joined game room', (gameRoom: string) => {
      this.setState({ gameRoom })
    })
    this.socket.on('poems updated', (poems: Array<IPoem>) => {
      console.log("UPDATE", poems)
      this.setState({ poems })
    })
    this.socket.on('game started', () => {
      this.setState({ gameStarted: true })
    })
  }

  handleCreateGameRoom = () => {
    const gameRoom = (Math.floor(Math.random()*90000) + 10000).toString();
    this.socket.emit('join game room', gameRoom, this.state.username)
  }

  handleJoinGameRoom = () => {
    this.socket.emit('join game room', this.state.joinGameRoom, this.state.username)
  }

  handleStartGame = () => {
    this.socket.emit('start game', this.state.gameRoom)
  }

  handleSubmitLine1 = (line: string, poemId: string) => {
    this.socket.emit('add line 1', line, poemId)
  }

  handleSubmitLine2 = (line: string, poemId: string) => {
    this.socket.emit('add line 2', line, poemId)
  }

  handleSubmitLine3 = (line: string, poemId: string) => {
    this.socket.emit('add line 3', line, poemId)
  }

  handleSubmitLine4 = (line: string, poemId: string) => {
    this.socket.emit('add line 4', line, poemId)
  }

  handleSubmitLine5 = (line: string, poemId: string) => {
    this.socket.emit('add line 5', line, poemId)
  }

  showLine = (username: string, poem: IPoem, poemLine: string, poetOwner: ListNode<string> | null): boolean => {
    if (!poetOwner) return false;

    const poetIsMe = (poet: string) => poet === username;
    const line1Complete = (poem: IPoem) => !!poem.line1.value;
    const line1CompleteUser = (poem: IPoem) => (line1Complete(poem) && poetIsMe(poetOwner.next!.data));
    const lines12Complete = (poem: IPoem) => line1Complete(poem) && !!poem.line2.value;
    const lines12CompleteUser = (poem: IPoem) => (lines12Complete(poem) && poetIsMe(poetOwner.next!.next!.data));
    const lines123Complete = (poem: IPoem) => lines12Complete(poem) && !!poem.line3.value;
    const lines123CompleteUser = (poem: IPoem) => (lines123Complete(poem) && poetIsMe(poetOwner.next!.next!.next!.data));
    const lines1234Complete = (poem: IPoem) => (lines123Complete(poem) && !!poem.line4.value && poetIsMe(poetOwner.next!.next!.next!.next!.data));

    if(poemLine === 'line1') {
      return username === poetOwner.data
        || line1CompleteUser(poem)
        || lines12CompleteUser(poem)
        || lines123CompleteUser(poem)
        || lines1234Complete(poem);
    } else if (poemLine === 'line2') {
      return line1CompleteUser(poem)
        || lines12CompleteUser(poem)
        || lines123CompleteUser(poem)
        || lines1234Complete(poem);
    } else if (poemLine === 'line3'){
      return lines12CompleteUser(poem)
      || lines123CompleteUser(poem)
      || lines1234Complete(poem);
    } else if (poemLine === 'line4'){
      return lines123CompleteUser(poem)
        || lines1234Complete(poem);
    } else if (poemLine === 'line5'){
      return lines1234Complete(poem);
    }
    return false;
  }

  currentlyEditingLine = (poem: IPoem): boolean => {
    return (poem.line1.value === '' && poem.line1.show === true)
      || (poem.line2.value === '' && poem.line2.show === true)
      || (poem.line3.value === '' && poem.line3.show === true)
      || (poem.line4.value === '' && poem.line4.show === true)
      || (poem.line5.value === '' && poem.line5.show === true);
  }

  render() {
    const poets = this.state.poems.map(poem => poem.username);
    const circularLinkedPoets = new CircularLinkedList<string>();
    poets.forEach(poet => circularLinkedPoets.append(poet));

    const assignedPoems = this.state.poems.map(poem => {
      const poetOwner = circularLinkedPoets.getWhere(poem.username);
      return ({
        ...poem,
        line1: {
          ...poem.line1,
          show: this.showLine(this.state.username, poem, 'line1', poetOwner),
          assignedTo: poetOwner ? poetOwner.data : ''
        },
        line2: {
          ...poem.line2,
          show: this.showLine(this.state.username, poem, 'line2', poetOwner),
          assignedTo: poetOwner && poetOwner.next ? poetOwner.next.data : ''
        },
        line3: {
          ...poem.line3,
          show: this.showLine(this.state.username, poem, 'line3', poetOwner),
          assignedTo: poetOwner && poetOwner.next && poetOwner.next.next ? poetOwner.next.next.data : ''
        },
        line4: {
          ...poem.line4,
          show: this.showLine(this.state.username, poem, 'line4', poetOwner),
          assignedTo: poetOwner && poetOwner.next && poetOwner.next.next && poetOwner.next.next.next ? poetOwner.next.next.next.data : ''
        },
        line5: {
          ...poem.line5,
          show: this.showLine(this.state.username, poem, 'line5', poetOwner),
          assignedTo: poetOwner && poetOwner.next && poetOwner.next.next && poetOwner.next.next.next && poetOwner.next.next.next.next ? poetOwner.next.next.next.next.data : ''
        },
      });
    });

    const visiblePoems = assignedPoems.filter(this.currentlyEditingLine);
    const completedPoems = this.state.poems.filter(poem => poem.line5.value !== '');

    return (
      <div className='container'>
        <div className='user-box'>
          <div style={{ fontSize: 34, fontWeight: 200, color: 'black', padding: '8px 0' }}>
            The Limerick Game
          </div>
          {this.state.gameRoom && (
            <>
              <div>Game Room: {this.state.gameRoom}</div>
              <span>Players in room: </span>
              <span>
                {this.state.poems.map((poem, i) => {
                  return (
                    <span key={poem.poemId}>
                      {poem.username}{i + 1 < this.state.poems.length && ', '}
                    </span>
                  )
                })}
              </span>
            </>
          )}
        </div>
        {this.state.gameRoom ? (
          completedPoems.length === this.state.poems.length ? (
            <div style={{ position: 'relative', top: 100, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Paper>
                <Button color='primary' onClick={() => this.setState(state => ({ showCompleted: !state.showCompleted }))}>
                  {this.state.showCompleted ? 'Hide' : 'Show'} Completed Poems
                </Button>
              </Paper>
              <div style={{ height: 450, overflow: 'auto', marginTop: 8 }}>
                {this.state.showCompleted && (
                  completedPoems.map(poem => (
                    <CompletedPoemBox
                      key={poem.poemId}
                      poem={poem}
                    />
                  ))
                )}
              </div>
            </div>
          ) : (
            <div style={{ position: 'relative', top: 100, height: 400, overflow: 'auto' }}>
              {!this.state.gameStarted && (
                <Paper>
                  <Button onClick={this.handleStartGame}>Start Game</Button>
                </Paper>
              )}
              {this.state.gameStarted && (
                <>
                  {visiblePoems.map(poem => (
                    <PoemBox
                      key={poem.poemId}
                      poem={poem}
                      handleSubmitLine1={this.handleSubmitLine1}
                      handleSubmitLine2={this.handleSubmitLine2}
                      handleSubmitLine3={this.handleSubmitLine3}
                      handleSubmitLine4={this.handleSubmitLine4}
                      handleSubmitLine5={this.handleSubmitLine5}
                    />
                  ))}
                  
                  {visiblePoems.length === 0 && completedPoems.length < this.state.poems.length && (
                    <div>Waiting on other poets...</div>
                  )}
                </>
              )}
            </div>
          )
        ) : (
          <div>
            <Paper className='join-game-container'>
              <TextField
                label="Name"
                value={this.state.username}
                onChange={ev => this.setState({ username: ev.target.value })}
                margin="normal"
              />
              <TextField
                label="Game Room Number"
                value={this.state.joinGameRoom}
                onChange={ev => this.setState({ joinGameRoom: ev.target.value })}
                margin="normal"
              />
              <Button
                color='primary'
                disabled={!this.state.joinGameRoom || !this.state.username}
                onClick={this.handleJoinGameRoom}
              >
                Join Game
              </Button>
              <div>OR</div>
              <Button
                color='primary'
                onClick={this.handleCreateGameRoom}
                disabled={!this.state.username}
              >
                Create New Game
              </Button>
            </Paper>
          </div>
        )}
      </div>
    )
  }
}

export default App






