interface BatchRequest {
  id: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  resolve: (data: any) => void;
  reject: (error: any) => void;
}

class RequestBatcher {
  private queue: BatchRequest[] = [];
  private batchTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly batchSize = 10;
  private readonly batchDelay = 100; // ms

  // Optimization: Add request to batch queue
  addRequest(request: Omit<BatchRequest, 'resolve' | 'reject'>): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        ...request,
        resolve,
        reject,
      });

      // Process batch if queue is full
      if (this.queue.length >= this.batchSize) {
        this.processBatch();
      } else {
        // Schedule batch processing
        this.scheduleBatch();
      }
    });
  }

  // Optimization: Schedule batch processing
  private scheduleBatch() {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }

    this.batchTimer = setTimeout(() => {
      this.processBatch();
    }, this.batchDelay);
  }

  // Optimization: Process batch of requests
  private async processBatch() {
    if (this.queue.length === 0) return;

    const currentBatch = this.queue.splice(0, this.batchSize);
    
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    // Group requests by endpoint and method
    const groupedRequests = new Map<string, BatchRequest[]>();
    
    currentBatch.forEach(request => {
      const key = `${request.method}:${request.endpoint}`;
      if (!groupedRequests.has(key)) {
        groupedRequests.set(key, []);
      }
      groupedRequests.get(key)!.push(request);
    });

    // Process each group
    for (const [key, requests] of groupedRequests) {
      try {
        await this.processRequestGroup(requests);
      } catch (error) {
        console.error('Batch processing error:', error);
        // Reject all requests in this group
        requests.forEach(request => request.reject(error));
      }
    }
  }

  // Optimization: Process a group of similar requests
  private async processRequestGroup(requests: BatchRequest[]) {
    // For GET requests, we can potentially combine them
    if (requests[0].method === 'GET' && requests.length > 1) {
      // Check if we can create a batch GET request
      const canBatch = requests.every(r => 
        r.endpoint.startsWith('/parent/children') || 
        r.endpoint.startsWith('/driver/bus')
      );

      if (canBatch) {
        // Create batch request
        const batchEndpoint = this.createBatchEndpoint(requests);
        try {
          const response = await this.executeBatchRequest(batchEndpoint, 'GET');
          this.distributeBatchResponse(requests, response);
          return;
        } catch (error) {
          // Fall back to individual requests
          console.warn('Batch request failed, falling back to individual requests');
        }
      }
    }

    // Fall back to individual requests
    await Promise.all(requests.map(request => this.processIndividualRequest(request)));
  }

  // Optimization: Create batch endpoint
  private createBatchEndpoint(requests: BatchRequest[]): string {
    const ids = requests.map(r => r.id).join(',');
    return `/batch?ids=${ids}&endpoint=${encodeURIComponent(requests[0].endpoint)}`;
  }

  // Optimization: Execute batch request
  private async executeBatchRequest(endpoint: string, method: string): Promise<any> {
    const { api } = await import('@/service/apiInterceptors');
    const response = await api.request({
      url: endpoint,
      method: method as any,
    });
    return response.data;
  }

  // Optimization: Distribute batch response
  private distributeBatchResponse(requests: BatchRequest[], response: any) {
    // Assuming response is an array or object with results
    if (Array.isArray(response)) {
      requests.forEach((request, index) => {
        if (response[index]) {
          request.resolve(response[index]);
        } else {
          request.reject(new Error('No data for request'));
        }
      });
    } else {
      // Object response with keyed results
      requests.forEach(request => {
        if (response[request.id]) {
          request.resolve(response[request.id]);
        } else {
          request.reject(new Error('No data for request'));
        }
      });
    }
  }

  // Optimization: Process individual request
  private async processIndividualRequest(request: BatchRequest) {
    try {
      const { api } = await import('@/service/apiInterceptors');
      const response = await api.request({
        url: request.endpoint,
        method: request.method,
        data: request.data,
      });
      request.resolve(response.data);
    } catch (error) {
      request.reject(error);
    }
  }

  // Optimization: Clear all pending requests
  clear() {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
    
    this.queue.forEach(request => {
      request.reject(new Error('Request cancelled'));
    });
    
    this.queue = [];
  }
}

// Export singleton instance
export const requestBatcher = new RequestBatcher();

// Optimization: Utility function to use batching
export const batchedRequest = (
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any
): Promise<any> => {
  return requestBatcher.addRequest({
    id: `${Date.now()}-${Math.random()}`,
    endpoint,
    method,
    data,
  });
}; 