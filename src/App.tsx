import React from 'react'
import './App.css'
import socketIOClient from 'socket.io-client'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';

function CircularLinkedList(){  
  this.head = null;
}

CircularLinkedList.prototype.append = function(value) {
  var head = this.head
  var current = head
  var node = { value: value, next: null, previous: null };
  if(!head){
    node.next = node;
    node.previous = node;
    this.head = node;
 }
 else{
    while(current.next !== head){
       current = current.next;
    }
    
    node.next = head;
    node.previous = current;
 
    head.previous = node;
    current.next = node;
 }   
};

CircularLinkedList.prototype.getWhere = function(value) {
  let node = this.head;
  while (node.value !== value) {
    node = node.next
  }
  return node
}

interface ILineInput {
  lineName: string
  finalLine: { assignedTo: string, value: string, show: boolean }
  editingLine: string
  hint: string
  onChange: (val: string) => void
  onSubmit: () => void
}
const LineInput: React.SFC<ILineInput> = props => {
  const submitOnEnter = key => {
    key === 'Enter' && props.onSubmit()
  }
  return (
    props.finalLine.show && (
      <div style={{ padding: 8 }}>
        {props.finalLine.value ? (
          props.finalLine.value
        ) : (
          <span style={{ display: 'flex' }}>
            <TextField
              label={props.lineName}
              value={props.editingLine}
              onChange={ev => props.onChange(ev.target.value)}
              helperText={props.hint}
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
const CompletedPoemBox: React.SFC<ICompletedPoemBox> = props => {
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
    line1: { assignedTo: string, value: string, show: boolean }
    line2: { assignedTo: string, value: string, show: boolean }
    line3: { assignedTo: string, value: string, show: boolean }
    line4: { assignedTo: string, value: string, show: boolean }
    line5: { assignedTo: string, value: string, show: boolean }
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

interface ILine { value: string, assignedTo: string}

interface IState {
  username: string
  poems: Array<{
    poemId: string
    username: string
    line1: ILine
    line2: ILine
    line3: ILine
    line4: ILine
    line5: ILine
  }>
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
  socket = socketIOClient();
  componentDidMount() {
    this.socket.on('joined game room', gameRoom => {
      this.setState({ gameRoom })
    })
    this.socket.on('poems updated', poems => {
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
  handleSubmitLine1 = (line, poemId) => {
    this.socket.emit('add line 1', line, poemId)
  }
  handleSubmitLine2 = (line, poemId) => {
    this.socket.emit('add line 2', line, poemId)
  }
  handleSubmitLine3 = (line, poemId) => {
    this.socket.emit('add line 3', line, poemId)
  }
  handleSubmitLine4 = (line, poemId) => {
    this.socket.emit('add line 4', line, poemId)
  }
  handleSubmitLine5 = (line, poemId) => {
    this.socket.emit('add line 5', line, poemId)
  }
  showLine = (username, poem, poemLine, poetOwner) => {
    const poetIsMe = poet => poet === username
    const line1Complete = poem => !!poem.line1.value
    const line1CompleteUser = poem => (line1Complete(poem) && poetIsMe(poetOwner.next.value))
    const lines12Complete = poem => line1Complete(poem) && !!poem.line2.value
    const lines12CompleteUser = poem => (lines12Complete(poem) && poetIsMe(poetOwner.next.next.value))
    const lines123Complete = poem => lines12Complete(poem) && !!poem.line3.value
    const lines123CompleteUser = poem => (lines123Complete(poem) && poetIsMe(poetOwner.next.next.next.value))
    const lines1234Complete = poem => (lines123Complete(poem) && !!poem.line4.value && poetIsMe(poetOwner.next.next.next.next.value))
    if(poemLine === 'line1') {
      return username === poetOwner.value
        || line1CompleteUser(poem)
        || lines12CompleteUser(poem)
        || lines123CompleteUser(poem)
        || lines1234Complete(poem)
    } else if (poemLine === 'line2') {
      return line1CompleteUser(poem)
        || lines12CompleteUser(poem)
        || lines123CompleteUser(poem)
        || lines1234Complete(poem)
    } else if (poemLine === 'line3'){
      return lines12CompleteUser(poem)
      || lines123CompleteUser(poem)
      || lines1234Complete(poem)
    } else if (poemLine === 'line4'){
      return lines123CompleteUser(poem)
        || lines1234Complete(poem)
    } else if (poemLine === 'line5'){
      return lines1234Complete(poem)
    }
  }
  currentlyEditingLine = poem => {
    return (poem.line1.value === '' && poem.line1.show === true)
      || (poem.line2.value === '' && poem.line2.show === true)
      || (poem.line3.value === '' && poem.line3.show === true)
      || (poem.line4.value === '' && poem.line4.show === true)
      || (poem.line5.value === '' && poem.line5.show === true)
  }
  render() {
    const poets = this.state.poems.map(poem => poem.username);
    const circularLinkedPoets = new CircularLinkedList();
    poets.forEach(poet => circularLinkedPoets.append(poet))
    // for each poem, assign each line to a user
    const assignedPoems = this.state.poems.map(poem => {
      const poetOwner = circularLinkedPoets.head ? circularLinkedPoets.getWhere(poem.username) : new CircularLinkedList().append(null)
      return ({
        ...poem,
        line1: {
          ...poem.line1,
          show: this.showLine(this.state.username, poem, 'line1', poetOwner),
          assignedTo: poetOwner.value
        },
        line2: {
          ...poem.line2,
          show: this.showLine(this.state.username, poem, 'line2', poetOwner),
          assignedTo: poetOwner.next.value
        },
        line3: {
          ...poem.line3,
          show: this.showLine(this.state.username, poem, 'line3', poetOwner),
          assignedTo: poetOwner.next.next.value
        },
        line4: {
          ...poem.line4,
          show: this.showLine(this.state.username, poem, 'line4', poetOwner),
          assignedTo: poetOwner.next.next.next.value
        },
        line5: {
          ...poem.line5,
          show: this.showLine(this.state.username, poem, 'line5', poetOwner),
          assignedTo: poetOwner.next.next.next.next.value
        },
      })
    })
    const visiblePoems = assignedPoems.filter(this.currentlyEditingLine)
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
          <div style={{ display: 'flex', flexDirection: 'column' }}>
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
                {completedPoems.length === this.state.poems.length ? (
                  <Paper>
                    <Button color='primary' onClick={() => this.setState(state => ({ showCompleted: !state.showCompleted }))}>
                      {this.state.showCompleted ? 'Hide' : 'Show'} Completed Poems
                    </Button>
                  </Paper>
                ) : null}
                {this.state.showCompleted && (
                  completedPoems.map(poem => (
                    <CompletedPoemBox
                      key={poem.poemId}
                      poem={poem}
                    />
                  ))
                )}
                {visiblePoems.length === 0 && completedPoems.length < this.state.poems.length && (
                  <div>Waiting on next poem...</div>
                )}
              </>
            )}
          </div>
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
