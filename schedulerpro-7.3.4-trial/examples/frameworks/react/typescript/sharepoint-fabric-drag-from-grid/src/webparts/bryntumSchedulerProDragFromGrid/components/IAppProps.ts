import Service from '../data/service/Service';

export interface IAppProps {
    title: string
    description: string
    service: Service
    listId: string
    startDate: Date
    range: number
}
