"use client"; 

import React, { useState } from 'react';
import MockData from "@/MockData/data.json"
import './style.css'
export interface TreeNode {
  id: string;
  name: string;
  children?: TreeNode[];
}

export interface CheckboxTreeProps {
  data: TreeNode[];
}

const TreeView: React.FC = () => {
  const convertToObjectArray = (obj:  TreeNode): TreeNode[] => {
    return Object.entries(obj).map(([key, value]) => ({
      ...value,
      children: value.children ? convertToObjectArray(value.children) : []
    }));
  };

  const data = convertToObjectArray(MockData)

  const [checkedNodes, setCheckedNodes] = useState<string[]>([]);

  const getAllChildrenIds = (nodeId: string): string[] => {
    const node = findNode(data, nodeId);
    if (!node || !node.children) return [];

    let childrenIds: string[] = [];
    node.children.forEach((child) => {
      childrenIds.push(child.id);
      const childChildrenIds = getAllChildrenIds(child.id);
      childrenIds.push(...childChildrenIds);
    });
    return childrenIds;
  };

  const findNode = (nodes: TreeNode[], nodeId: string): TreeNode | undefined => {
    for (const node of nodes) {
      if (node.id === nodeId) {
        return node;
      } else if (node.children) {
        const foundNode = findNode(node.children, nodeId);
        if (foundNode) {
          return foundNode;
        }
      }
    }
    return undefined;
  };

  const findParentNode = (nodes: TreeNode[], nodeId: string): TreeNode | undefined => {
    for (const node of nodes) {
      if (node.children && node.children.some(child => child.id === nodeId)) {
        return node;
      } else if (node.children) {
        const parentNode = findParentNode(node.children, nodeId);
        if (parentNode) {
          return parentNode;
        }
      }
    }
    return undefined;
  };


  const handleCheckboxChange = (nodeId: string, checked: boolean) => {
    let updatedCheckedNodes: string[];
  
    if (checked) {
      updatedCheckedNodes = [...checkedNodes, nodeId];
      const allDescendantsIds = getAllDescendantsIds(nodeId);
      updatedCheckedNodes.push(...allDescendantsIds);
      updatedCheckedNodes = Array.from(new Set(updatedCheckedNodes));
      updateParentNodes(data, nodeId, updatedCheckedNodes); 
    } else {
      updatedCheckedNodes = checkedNodes.filter((id) => id !== nodeId);
      const allDescendantsIds = getAllDescendantsIds(nodeId);
      updatedCheckedNodes = updatedCheckedNodes.filter((id) => !allDescendantsIds.includes(id));
      updateParentNodes(data, nodeId, updatedCheckedNodes); 
    }
  
    setCheckedNodes(updatedCheckedNodes);
  };

  
  const updateParentNodes = (nodes: TreeNode[], nodeId: string, updatedCheckedNodes: string[]) => {
    const parentNode = findParentNode(nodes, nodeId);
    if (parentNode) {
      const allChildrenIds = getAllChildrenIds(parentNode.id);
      const allChildrenChecked = allChildrenIds.every(childId => updatedCheckedNodes.includes(childId));
      const parentNodeIndex = updatedCheckedNodes.indexOf(parentNode.id);
  
      if (allChildrenChecked && parentNodeIndex === -1) {
        updatedCheckedNodes.push(parentNode.id);
      } else if (!allChildrenChecked && parentNodeIndex !== -1) {
        updatedCheckedNodes.splice(parentNodeIndex, 1);
      }
  
      updateParentNodes(nodes, parentNode.id, updatedCheckedNodes);
    }
  };
  
  
  const getAllDescendantsIds = (nodeId: string): string[] => {
    const node = findNode(data, nodeId);
    if (!node || !node.children) return [];
  
    let descendantsIds: string[] = [];
    node.children.forEach((child) => {
      descendantsIds.push(child.id);
      const childDescendantsIds = getAllDescendantsIds(child.id);
      descendantsIds.push(...childDescendantsIds);
    });
    return descendantsIds;
  };
  
  const findAllParentNodes = (nodeId: string): TreeNode[] => {
    let parentNodes: TreeNode[] = [];
    const parentNode = findParentNode(data, nodeId);
    if (parentNode) {
      parentNodes.push(parentNode);
      parentNodes = parentNodes.concat(findAllParentNodes(parentNode.id));
    }
    return parentNodes;
  };



  const renderTree = (nodes: TreeNode[] | undefined) => {
    
    return nodes?.map(node => (
      <div key={node.id}>
        <div className='container__item'>
          <input id={`dropdown_${node.id}`} type="checkbox" className='input_drop' name="checkbox" />
          <label htmlFor={`dropdown_${node.id}`} className="dropdown"></label>
          <label className='conntent__item'>
            <input 
              type="checkbox"
              checked={checkedNodes.includes(node.id)}
              onChange={(e) => handleCheckboxChange(node.id, e.target.checked)}
            />
            {node.name}
          </label>
          {node.children && (
            <div className='content' style={{ marginLeft: '20px' }}>{renderTree(node.children)}</div>
          )}
        </div>        
      </div>
    ));
  };

  return <div>{renderTree(data)}</div>;
};

export default TreeView;
