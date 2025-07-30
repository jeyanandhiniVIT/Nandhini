import { Request, Response } from 'express';
import type { Project, Prisma } from '@prisma/client';
import * as projectService from '../services/project.service';
import * as projectValidators from '../validators/project.validators';
import { z } from 'zod';

export const createProject = async (req: Request, res: Response) => {
    try {
        const validatedData = projectValidators.createProjectSchema.parse(req.body);
        const newProject: Project = await projectService.createProject(validatedData as Prisma.ProjectCreateInput);
        res.status(201).json(newProject);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ message: 'Error creating project' });
    }
};

export const getAllProjects = async (req: Request, res: Response) => {
    try {
        const projects = await projectService.getAllProjects();
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Error getting projects' });
    }
};

export const getProjectById = async (req: Request, res: Response) => {
    const projectId = req.params.projectId;
    try {
        const project = await projectService.getProjectById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ message: 'Error getting project' });
    }
};

export const updateProject = async (req: Request, res: Response) => {
    const projectId = req.params.projectId;
    try {
        const validatedData = projectValidators.updateProjectSchema.parse(req.body);
        const updatedProject = await projectService.updateProject(projectId, validatedData as Prisma.ProjectUpdateInput);
        if (!updatedProject) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.status(200).json(updatedProject);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ message: 'Error updating project' });
    }
};

export const deleteProject = async (req: Request, res: Response) => {
    const projectId = req.params.projectId;
    try {
        const deleted = await projectService.deleteProject(projectId);
        if (!deleted) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting project' });
    }
};
