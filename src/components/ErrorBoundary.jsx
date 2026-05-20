import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    this.setState({ error, info });
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding:20, color:'#e09090', background:'rgba(196,77,77,0.1)', margin:20, borderRadius:8, fontFamily:'monospace', fontSize:13 }}>
          <h3 style={{color:'#c44d4d'}}>⚠ 渲染错误</h3>
          <pre style={{whiteSpace:'pre-wrap',wordBreak:'break-all',fontSize:11}}>
            {this.state.error.message}
          </pre>
          {this.state.info && <pre style={{whiteSpace:'pre-wrap',fontSize:10,color:'#888',marginTop:8}}>{this.state.info.componentStack}</pre>}
          <button onClick={()=>this.setState({error:null})} style={{marginTop:10,padding:'6px 14px',borderRadius:6,border:'1px solid #c44d4d',background:'transparent',color:'#c44d4d',cursor:'pointer'}}>
            重试
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
