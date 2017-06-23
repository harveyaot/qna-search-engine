import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { extend } from 'lodash'
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import Toggle from 'material-ui/Toggle';
import FlatButton from 'material-ui/FlatButton';
import {
    Layout,
    TopBar,
    SearchkitProvider,
    LayoutBody,
    LayoutResults,
    ActionBar,
    ActionBarRow,
    NoHits,
    SearchkitManager,
    SearchBox,
    SideBar,
    RefinementListFilter,
    Hits,
    HitsStats,
    SearchkitComponent,
    SelectedFilters,
    MenuFilter,
    HierarchicalMenuFilter,
    Pagination,
    ResetFilters
    }
 from "searchkit";
import {List, ListItem} from 'material-ui/List';
import Divider from 'material-ui/Divider';
import {deepOrange400 , grey400, darkBlack, lightBlack} from 'material-ui/styles/colors';

const styles ={
    answer:{
        fontSize: 17,
        fontStyle: "italic"
    },
    query:{
         textTransform: "capitalize"
    }
}

function sort_by_select(a, b)
{
    return b.is_selected - a.is_selected;   
}


const searchkit = new SearchkitManager("http://stcvm-linux22:9200/marco/qna/")
const HitItem = (props) => {
  let idx = 1;
  const {bemBlocks, result} = props
  const source:any = extend({}, result._source, result.highlight)
  source.passages.sort(sort_by_select);
    let width = window.screen.availWidth;
    let width_prop = width * 0.9
    if (width > 720) {
      width_prop = width * 0.6
    } 
    
    const onClick = () => {
        if (document.getElementById(source.query_id).style.display == "none"){
            document.getElementById(source.query_id).style.display = "block"
        }else{
            document.getElementById(source.query_id).style.display = "none"
        }
    }

  return (
     <div className={bemBlocks.item().mix(bemBlocks.container("item"))} data-qa="hit">
         <div className={bemBlocks.item("details")}> 
              <Card style={{width:width_prop}}>
                <CardTitle style={styles.query} title={source.query + "?"}/>
                <CardText>
                    <span style={styles.answer}>{source.answers}</span>
                </CardText>
                <FlatButton label="Show Passages" primary={true} onClick={onClick}/>
                <div id={source.query_id} style={{display: "none"}}>
                    {source.passages.map((_p) =>
                            <ListItem style = {{color:_p.is_selected ? deepOrange400: darkBlack}}
                                primaryText = {_p.passage_text}>
                                <a href={_p.url} target="_blank">{_p.url}</a>
                            </ListItem>
                        )
                    }
                </div>
            </Card>
        </div>
    </div>
  )
}

 const customQueryBuilder = (query) => {
      return {
          "bool": {
            "should": [
              {
                "simple_query_string": {
                  "query": query,
                  "fields": [
                    "query"
                  ],
                  "default_operator":"AND"
                }
              }
            ]
          }
        }

    }

const App = ()=> (
  <SearchkitProvider searchkit={searchkit}>
    <Layout>
    <TopBar>
        <SearchBox 
          autofocus={true}
          searchOnChange={true}
          prefixQueryFields={["query^10","answers^5","passages^1"]}
          queryOptions = {{"default_operator":"AND"}}
          />

    </TopBar>
      <LayoutBody>
          <SideBar>
                <HierarchicalMenuFilter fields={["query_type"]} title="query_type" id="query_type"/>
          </SideBar>
        <LayoutResults>
          <ActionBar>
            <ActionBarRow>
              <HitsStats/>
            </ActionBarRow>
            <ActionBarRow>
              <SelectedFilters/>
              <ResetFilters/>
            </ActionBarRow>
          </ActionBar>
          <Hits mod="sk-hits-list" hitsPerPage={10} itemComponent={HitItem}
            sourceFilter={["query", "answers","query_id","passages", "query_type"]}/>
          <NoHits/>
          <Pagination showNumbers={true}/>
        </LayoutResults>
      </LayoutBody>
    </Layout>
  </SearchkitProvider>
)
export default App;
